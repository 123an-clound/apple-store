// Mirrors private.apple_has_role() in the database. The DB is the real gate
// (RLS); this only decides what the UI offers.
const RANK = { viewer: 1, editor: 2, owner: 3 };

export const ROLE_LABELS = { owner: 'Chủ sở hữu', editor: 'Biên tập', viewer: 'Chỉ xem' };

export function hasRole(role, min) {
  return (RANK[role] ?? 0) >= RANK[min];
}
