const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");
const readline = require("readline");

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const askQuestion = (question) => {
  return new Promise((resolve) => rl.question(question, resolve));
};

const setPassword = async (email, password) => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      await prisma.user.update({
        where: { email },
        data: { passhash: hashedPassword },
      });
      console.log(`Password for user ${email} has been updated.`);
    } else {
      await prisma.user.create({
        data: {
          email,
          passhash: hashedPassword,
        },
      });
      console.log(`User ${email} has been created and password set.`);
    }
  } catch (error) {
    console.error("Error setting password:", error);
  } finally {
    await prisma.$disconnect();
    rl.close();
  }
};

const main = async () => {
  const command = process.argv[2];

  if (command === "set-user-password") {
    let email = process.env.USER_EMAIL;
    let password = process.env.USER_PASSWORD;

    if (!email) {
      email = await askQuestion("Enter user email: ");
    }

    if (!password) {
      password = await askQuestion("Enter password: ");
    }

    if (!email || !password) {
      console.error("User email and password are required");
      process.exit(1);
    }

    await setPassword(email, password);
  } else {
    console.error(
      "Please specify a command to be executed.",
      "\n\nCommands available:",
      "\n  set-user-password",
    );
    process.exit(1);
  }
};

main();
