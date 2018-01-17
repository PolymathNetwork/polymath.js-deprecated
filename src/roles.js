import { CustomerRole } from './types';

const roleToNumberObj: { [CustomerRole]: number } = {
  investor: 1,
  delegate: 2, // Solidity code requires role == 2 for delegate but lists delegate elsewhere as #3
  issuer: 3,
  marketmaker: 4,
};

export function roleToNumber(role: CustomerRole): number {
  return roleToNumberObj[role];
}

export function numberToRole(num: number): ?CustomerRole {
  const roles = Object.keys(roleToNumberObj);
  for (let i = 0; i < roles.length; i++) {
    const role = roles[i];

    if (roleToNumberObj[role] === num) {
      return role;
    }
  }

  return null;
}
