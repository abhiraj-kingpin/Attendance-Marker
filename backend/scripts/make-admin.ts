// One-off bootstrap: promotes an existing user to admin. There's no
// self-serve way to become the first admin (by design — /api/admin/* is
// otherwise fully locked down), so this runs directly against the
// database instead.
//
// Usage: npx ts-node scripts/make-admin.ts someone@example.com
import { prisma } from '../src/lib/prisma';

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: npx ts-node scripts/make-admin.ts <email>');
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`No user found with email "${email}" — sign up first via POST /api/auth/signup.`);
    process.exit(1);
  }

  await prisma.user.update({ where: { email }, data: { isAdmin: true } });
  console.log(`${email} is now an admin.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
