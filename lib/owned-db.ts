import { db } from './db';
// Every query includes ownership; callers obtain ownerId from a validated session.
export function ownedDb(ownerId: string) {
  return db.$extends({
    query: {
      pet: {
        async $allOperations({ args, query, operation }) {
          if (
            ['findMany', 'findFirst', 'findUnique', 'count', 'update', 'delete'].includes(operation)
          ) {
            Object.assign(args, { where: { ...('where' in args ? args.where : {}), ownerId } });
          } else {
            throw new Error('Unsupported scoped pet operation');
          }
          return query(args);
        },
      },
      medicalRecord: {
        async $allOperations({ args, query, operation }) {
          if (
            ['findMany', 'findFirst', 'findUnique', 'count', 'update', 'delete'].includes(operation)
          ) {
            Object.assign(args, {
              where: { ...('where' in args ? args.where : {}), pet: { ownerId } },
            });
          } else {
            throw new Error('Unsupported scoped record operation');
          }
          return query(args);
        },
      },
    },
  });
}
