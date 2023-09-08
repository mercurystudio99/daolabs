## MovementDAO/DAOLABS - DAO/NFT Application Interface

<p align="center" width="100%"> <img width="33%" src="/static/images/daolabs-lg.png"></p>
<p align="center" width="100%">https://move.xyz</p>

### Repository Resources

- [User Interface Design Figma](https://www.figma.com/file/8orucP9iXPsWnPhJa1guUF/JB-Treasury-UX?type=design&node-id=5007-107637&t=L3cPkqQyeqt07HGj-0)
- [Application Interface](https://github.com/mercurystudio99/daolabs)
- [Cloud Service - Pinning](https://github.com/DAOLABS-WTF/pinning-service)
- [Subgraph](https://github.com/DAOLABS-WTF/daolabs-subgraph)
- [Smart Contracts](https://github.com/DAOLABS-WTF/daolabs-contracts)
- [Documentation Website](https://docs.move.xyz/)

- [Snapshot](https://snapshot.org/#/snapshot.movedao.eth)
- [Documentation, Templates, Governance](https://docs.move.xyz/)

### Installation and Development

1. Create a [fork](https://docs.github.com/en/get-started/quickstart/fork-a-repo) of this repository.
1. Clone your fork and navigate to the root directory.
1. Install project dependencies.

```bash
yarn && yarn run dev
```

1. Create a `.env` file in the root directory which mirrors the `.env.sample`
   file. Learn how to define each field in the `.env` file in [Setup](#setup).

### Building

```bash
yarn && yarn run build
```

### Testing

It needs to build application first and then run:

```bash
yarn run test
```

To see html-report with trace run the following:

```bash
yarn run test:report
```

#### Setup

The following will be out of date as all API-KEYs are being brought into cloud function and will no longer be required by the frontend.

`juicebox-interface-svelte` relies on a number of services for development. Create an
account for each of the following services:

- [Infura](https://infura.io)
- [Pinata](https://pinata.cloud)
- [Blocknative](https://www.blocknative.com)

The following sections describe how to set up each service for local
development.

#### Infura

Juicebox-Svelte uses [Infura](https://infura.io) to connect to an Ethereum network
(mainnet, or one of the testnets).

Take the following steps to create an Infura project for local development:

1. Select **Create New Project** to begin creating a new Infura project.
1. Select the **Ethereum** option from the **Product** dropdown.
1. Enter a **Name** (for example, `juicebox-svelte-local`).
1. Select **Create** to create the project.

Next, copy the following fields into your `.env` file:

- **Project ID**. In the `.env` file, copy the **Project ID** into the
  `VITE_INFURA_ID` variable.
- **Endpoint**. This is the Ethereum network that will be used for testing. If
  you don't know which endpoint to use, select **mainnet**. In the `.env` file,
  copy the network name (e.g. 'mainnet', not the url) into the
  `VITE_INFURA_NETWORK` variable.

#### Piñata

Juicebox-Svelte uses [Piñata](https://pinata.cloud) to store project metadata. Juicebox-Svelte
projects set a name, description, logo, and other details when creating the
project. These details are saved on IPFS as a JSON file using Piñata, and the
CID gets stored on-chain with the Juicebox-Svelte project.

Take the following steps to set up Piñata for local development:

1. Create a Piñata API key
   ([learn more](https://docs.pinata.cloud/#your-api-keys)).
   - Enable the **Admin** toggle in the **Admin** field.
1. Copy the following fields into your `.env` file:
   - **API Key**. In the `.env` file, copy the **API Key** into the
     `VITE_PINATA_PINNER_KEY` variable.
   - **API Secret**. In the `.env` file, copy the **API Secret** into the
     `VITE_PINATA_PINNER_SECRET` variable.

#### Blocknative

Juicebox-Svelte uses [Blocknative](https://www.blocknative.com) to onboard users by
enabling wallet selection, connection, wallet checks, and real-time state
updates.

Take the following steps to set up Blocknative for local development:

1. Create a Blocknative API key
   ([learn more](https://docs.blocknative.com/webhook-api#setup-api-key)).
1. Copy the API key into the `VITE_BLOCKNATIVE_API_KEY` variable of the
   `.env` file.

#### The Graph

Juicebox-Svelte uses [The Graph](https://thegraph.com) to query the Ethereum network
using a GraphQL API.

1. Copy the URL into the `VITE_SUBGRAPH_URL` variable of the `.env` file.

### Usage

1. Start the app.

   ```bash
   yarn run dev
   ```

### Git workflow

We opt for a **rebase policy** where the repository history is kept flat and
clean. When a feature branch's development is complete, rebase/squash all the
work down to the minimum number of meaningful commits.

While the work is still in progress and a feature branch needs to be brought up
to date with the upstream target branch, use rebase – as opposed to pull or
merge – to avoid polluting the commit history with spurious merges.
[Learn more](https://www.atlassian.com/git/articles/git-team-workflows-merge-or-rebase)
about the differences between merge and rebase Git workflows.

#### Rebase procedure

You can rebase your feature branch with the following procedure, where
`feature-branch` is the name of your branch. Further explanation of rebase and
its options can be found
[here](https://docs.gitlab.com/ee/topics/git/git_rebase.html).

1. `git checkout feature-branch`
2. `git fetch origin main`
3. `git rebase origin/main`
4. `git push --force-with-lease`

### Approval guidelines

Before your PR is merged, it must meet the following criteria:

1. The PR follows the [Git workflow](#git-workflow) and contains no merge
   commits.
1. All CI checks pass.
1. The PR is approved by at least one [codeowner](.github/CODEOWNERS).
1. Significant UI/UX changes are discussed by other design/dev contributors.

### Juicebox-Svelte app release

All changes to the `main` branch will be automatically deployed via
[Fleek](https://fleek.co).

### Supported browsers

Juicebox supports the following web browsers:

- Google Chrome
- Mozilla Firefox
- Chromium-based browsers (e.g. Brave Browser)

## Translations

Juicebox uses [Crowdin](https://crowdin.com/project/juicebox-interface) for
managing translations. A GitHub workflow uploads new strings for translation to the
Crowdin project whenever code using the lingui translation macros is merged into
main.

Every day, translations are synced back down from Crowdin to a pull request to
`main`. We then merge these PR's into `main` manually.

### Marking strings for translation

Any strings that are added or modified in the source code should be marked for
translation. Use the `t` macro or the `Trans` component from the `@lingui/macro`
library. [Learn more](https://lingui.js.org/ref/macro.html).

```js
const myString = t`Example text`;
```

```html
<Trans>Example text</Trans>
```

**You must extract strings in PRs**. If your PR adds or modifies translated
strings, run the following command to generate new `.po` files:

```bash
yarn i18n:extract
```

### Adding a language (for devs)

1. Add the locale code, english name, and short and long alias's to
   `constants/languages/language-options.ts`.

   ```diff
   export const Languages: Language = {
      en: { code: 'en', name: 'english', short: 'EN', long: 'English' },
      zh: { code: 'zh', name: 'chinese', short: '中文', long: '中文' },
      ru: { code: 'ru', name: 'russian', short: 'RU', long: 'Pусский' },
   +  es: { code: 'es', name: 'spanish', short: 'ES', long: 'Español' },
   }
   ```

## License

1. Add the locale code to `./linguirc.json`.

   ```diff
   - "locales": ["en", "zh"]
   + "locales": ["en", "zh", "af"]
   ```

1. Add the locale code to `SUPPORTED_LOCALES` in `./src/constants/locale.ts`

   ```diff
   - export const SUPPORTED_LOCALES = ['en', 'zh']
   + export const SUPPORTED_LOCALES = ['en', 'zh', 'af']
   ```

1. Import the locale plurals in `./src/providers/LanguageProvider.tsx`.

   ```diff
   - import { en, zh } from 'make-plural/plurals'
   + import { en, zh, af } from 'make-plural/plurals'
   ```

1. Load the locale plurals in `./src/providers/LanguageProvider.tsx`

   ```diff
   i18n.loadLocaleData({
     en: { plurals: en },
     zh: { plurals: zh },
   + af: { plurals: af },
   })
   ```

1. Extract and compile the strings marked for translation. This creates a
   directory for the locale within the `./locale/` directory:

   ```bash
   yarn i18n:extract && yarn i18n:compile
   ```

Functions Environment Variables Setup:

1. Subgraph api key `functions/.env`
   - Env varibale key is `SUBGRAPH_API_KEY`
   - Get api key from this url https://thegraph.com/studio/apikeys/ by connecting to account [cptspacecadet.eth](https://etherscan.io/address/cptspacecadet.eth)
