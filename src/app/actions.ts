'use server';

import db from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getWheelOptions() {
  const stmt = db.prepare('SELECT * FROM wheel_options ORDER BY id DESC');
  return stmt.all() as { id: number; text: string }[];
}

export async function addWheelOption(text: string) {
  if (!text || text.length < 3 || text.length > 20) {
    return { error: 'A opção deve ter entre 3 e 20 caracteres.' };
  }

  try {
    const stmt = db.prepare('INSERT INTO wheel_options (text) VALUES (?)');
    stmt.run(text);
    revalidatePath('/');
    revalidatePath('/manage');
    return { success: true };
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: string }).code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return { error: 'Esta opção já existe.' };
    }
    return { error: 'Ocorreu um erro ao adicionar a opção.' };
  }
}

export async function deleteWheelOption(id: number) {
  try {
    const stmt = db.prepare('DELETE FROM wheel_options WHERE id = ?');
    stmt.run(id);
    revalidatePath('/');
    revalidatePath('/manage');
    return { success: true };
  } catch {
    return { error: 'Falha ao excluir opção.' };
  }
}

export async function saveResult(userId: string, name: string, optionWon: string) {
  if (!userId || !name || !optionWon) {
    return { error: 'Campos obrigatórios ausentes.' };
  }

  try {
    const stmt = db.prepare('INSERT INTO results (user_id, name, option_won) VALUES (?, ?, ?)');
    stmt.run(userId, name, optionWon);
    revalidatePath('/results');
    return { success: true };
  } catch {
    return { error: 'Falha ao salvar resultado.' };
  }
}

export async function getResults() {
  const stmt = db.prepare('SELECT * FROM results ORDER BY id DESC');
  return stmt.all() as {
    id: number;
    user_id: string;
    name: string;
    option_won: string;
    created_at: string;
  }[];
}
