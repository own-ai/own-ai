# ownAI

Welcome to ownAI, the platform for building and running AI assistants.
Our mission is to make AI a useful tool for society that everyone can use and operate independently.

## Table of Contents

- [Overview](#overview)
- [Quickstart](#quickstart)
- [Run on Your Server](#run-on-your-server)
- [Deploying to Vercel](#deploying-to-vercel)
- [Local Development Setup](#local-development-setup)
- [Contributing](#contributing)
- [Licensing](#licensing)
- [Support](#support)

## Overview

ownAI makes it easy for anyone to build their own AI. ownAI lets you create AI assistants for many purposes, such as personal assistants, marketing, customer service, internal chatbots, and more.

Users can teach their AI models by entering knowledge and uploading documents, so they don't need to be technical experts.
To learn more about ownAI, create your free account at [ownai.com](https://ownai.com).

ownAI is open source. You can run ownAI on your own server or in your company's data center. How to do that is described in this document.

## Quickstart

To quickly start ownAI using Docker, follow these steps:

1. Clone the repository: `git clone https://github.com/own-ai/own-ai.git`
2. Navigate to the cloned repository: `cd own-ai`
3. Copy the configuration file: `cp .env.example .env`
4. Edit the configuration file (`.env`) and adapt it to your settings. To start locally as quickly as possible, you can leave the file as it is. In a production environment, you must edit the values.
5. Start the Docker containers: `docker compose up -d`
6. Wait until the containers have started.
7. Download an embeddings model: `docker exec -it ownai-ollama-1 ollama pull nomic-embed-text`
8. Download an LLM model: `docker exec -it ownai-ollama-1 ollama pull phi3:mini`
9. Create a user: `docker exec -it ownai-ownai-1 npm run admin:set-user-password`
10. Open <http://localhost:3000/lab> and log in with the user you created.
11. Create your first AI. Please enter `default` as the URL for the first AI so that it can be accessed on the home page without a sub-path.
12. Access your AI at <http://localhost:3000>.

## Run on Your Server

The easiest way to run ownAI productively is with Docker, as described in the previous section.

Please just make sure that you remove the variables `NEXTAUTH_URL` and `NEXT_PUBLIC_ENABLE_LOCALHOST` from the `.env` file or set them to your domain and `0` respectively. The Docker image must then be rebuilt, as the environment variables are included when the Next.js project is compiled.

Alternatively, you can also install the Postgres and Redis dependencies directly on your server and refer to them in the `.env` file. ownAI can then be started directly with the command `next start`.

## Deploying to Vercel

To deploy ownAI to Vercel, follow these steps:

1. Sign up for a Vercel account at [vercel.com](https://vercel.com)
2. Install the Vercel CLI: `npm install -g vercel`
3. Log in to Vercel using the CLI: `vercel login`
4. Navigate to the root directory of the ownAI repository
5. Deploy the application to Vercel: `vercel --prod`

## Local Development Setup

We are very pleased that you are interested in developing ownAI!
To set up the local development environment, follow these steps:

1. Install Node.js 18 (or higher) and [pnpm](https://pnpm.io/).
2. Clone the repository: `git clone https://github.com/own-ai/own-ai.git`
3. Navigate to the cloned repository: `cd own-ai`
4. Set the environment variables. You can either copy the file `.env.example` to `.env` and edit it. We recommend creating a Vercel project and setting up the environment there. You can then load the variables with the command `vercel env pull .env`.
5. Install the dependencies: `pnpm install`
6. Start the development server: `pnpm dev`
7. Access the application at `http://localhost:3000`

## Contributing

We welcome contributions to ownAI! If you have an idea for a new feature or improvement, please submit a pull request or [vote on feature requests](https://ownai.canny.io/feature-requests).

## Licensing

ownAI is licensed under the GNU Affero General Public License version 3 (AGPLv3). This license allows you to use, modify, and distribute the software, subject to the conditions that any modifications you make must also be licensed under the same terms, and that any derivative works must be made available under the same terms.

For more information on the AGPLv3 license, please visit <https://www.gnu.org/licenses/agpl-3.0.en.html>.

## Support

If you encounter any issues or have any questions, please open an issue on this repository or write to [support@ownai.com](mailto:support@ownai.com). We'll do our best to help you out.

Happy AI building!

Your ownAI Team
