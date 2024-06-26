# sf-raven

[![NPM](https://img.shields.io/npm/v/sf-raven.svg?label=sf-raven)](https://www.npmjs.com/package/sf-raven) [![Downloads/week](https://img.shields.io/npm/dw/sf-raven.svg)](https://npmjs.org/package/sf-raven) [![License](https://img.shields.io/badge/License-BSD%203--Clause-brightgreen.svg)](https://raw.githubusercontent.com/salesforcecli/sf-raven/main/LICENSE.txt)

A plugin for the Salesforce CLI built by Tom Carman.

[sf-raven](https://github.com/tomcarman/sf-raven) now replaces [sfdx-raven](https://github.com/tomcarman/sfdx-raven/).

## Why a new plugin?

I originally built [sfdx-raven](https://github.com/tomcarman/sfdx-raven/) in 2020, but the Salesforce CLI landscape has changed a lot since then. Rather than attempting to [migrate the original plugin from sfdx to sf](https://github.com/salesforcecli/cli/wiki/Migrate-Plugins-Built-for-sfdx), it felt cleaner to start a new project and leverage the new architecture and scaffolding tools that come with the new sf cli.

## Improvements over sfdx-raven

- Built on [sf not sfdx](https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_setup_move_to_sf_v2.htm).
- Uses the latest version of [oclif](https://oclif.io/blog/2022/01/12/announcing-oclif-v2/).
- Commands now follow the [sf command structure](https://github.com/salesforcecli/cli/wiki/Design-Guidelines#Command-Structure) guidelines - `<topic> <action> <resource | sub-action> [flags]`. For example:
  - `info:fields` becomes `object display fields`
  - `utils:event:listen` becomes `event subscribe`
- Code now meets ESlint rules for TypeScript, including the Salesforce CLI Plugin custom rules.
- The [Salesforce tooling / documentation](https://github.com/salesforcecli/cli/wiki/Code-Your-Plugin) for building custom plugins has matured a lot over the past couple years, which will make it easier to update the plugin going forward.

More commands will be ported/added over time - see [Todo](#Todo).

## Command Quick Reference

Full details, usage, examples etc are further down, or can be accessed via `--help` on the commands.

#### sf raven object display

- [sf raven object display fields](#sf-raven-object-display-fields)
  - Show field information for a given sObject.
- [sf raven object display recordtypes](#sf-raven-object-display-recordtypes)
  - Show RecordType information for a given sObject.

#### sf raven audit display

- [sf raven audit display](#sf-raven-audit-display)
  - Show recent entries in the Setup Audit Trail.

#### sf raven event

- [sf raven event subscribe](#sf-raven-event-subscribe)
  - Subscribe to Platform Events.

<!-- #### sfdx:raven:utils
* [sfdx raven:utils:deploy:branch2org](#sfdx-ravenutilsdeploybranch2org)
  * Deploy a git branch to an org
* [sfdx raven:utils:diff](#sfdx-ravenutilsdiff)
  * Diff individual metadata items (class, object etc) between orgs
* [sfdx raven:utils:dashboarduser:update](#sfdx-ravenutilsdashboarduserupdate)
  * Change the running user of Dashboards -->

## Setup

### Quick Install

Assuming you already have the [sf cli](https://developer.salesforce.com/tools/salesforcecli) installed, the plugin can be installed by running:

`sf plugins install sf-raven`

Note: You'll be prompted that this is not officially code-signed by Salesforce - like any custom plugin. You can just accept this when prompted, or alternatively you can [whitelist it](https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_setup_allowlist.htm)

### Updating the plugin

The plugin can be updated to the latest version using

`sf plugins update`

### Install from source

1. Install the [SDFX CLI](https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_setup_install_cli.htm)
2. Clone the repository: `git clone git@github.com:tomcarman/sf-raven.git`
3. Install npm modules: `npm install`
4. Link the plugin: `sfdx plugins:link .`

## Compatibility

- **macOS**
  - Plugin has been built on macOS and will always run on macOS

<!-- * **Windows**
  * Work on Windows 10 1803+ (this is that latest build I have access to)
  * Known Issues:
    * Emoji will not work in cmd.exe / powershell - so you may seem some funny characters when running the plugin - this can be ignored. Emoji may work in Windows Terminal, but I have not managed to test yet
    * I don't think 'diff' is available on windows cli, so `sfdx:raven:utils:diff` is not likely to work.

* **Linux**
  * Only tested on an Ubuntu installation on [WSL](https://docs.microsoft.com/en-us/windows/wsl/about), but should work. -->

## Todo

- Migrate remaining commands from [sfdx-raven](https://github.com/tomcarman/sfdx-raven/)
  - sfdx raven:utils:deploy:branch2org
  - sfdx raven:utils:diff
  - sfdx raven:utils:dashboarduser:update - tbc
- Get the sObject Type for a given Id
- Get the picklist values for a given picklist
- Clone a record

## sf raven object display fields

Show field information for a given sObject.

```
USAGE
  $ sf raven object display fields -o <value> -s <value> [--json]

FLAGS
  -o, --target-org=<value>  (required) Login username or alias for the target org.
  -s, --sobject=<value>     (required) The API name of the sObject that you want to view fields for.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Show field information for a given sObject.

  FieldDefinition metadata is queried for the given sObject. The field Labels, API names, and Type are displayed.

EXAMPLES
  $ sf raven object display fields --target-org dev --sobject Account

  $ sf raven object display fields --target-org dev --sobject My_Custom_Object__c


OUTPUT

Name               Developer Name  Type
────────────────── ─────────────── ─────────────────
Account Number     AccountNumber   Text(40)
Account Source     AccountSource   Picklist
Annual Revenue     AnnualRevenue   Currency(18, 0)
...
```

## sf raven object display recordtypes

Show RecordType information for a given sObject.

```
USAGE
  $ sf raven object display recordtypes -o <value> -s <value> [--json]

FLAGS
  -o, --target-org=<value>  (required) Login username or alias for the target org.
  -s, --sobject=<value>     (required) The API name of the sObject that you want to view Record Types for.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Show RecordType information for a given sObject.

  RecordType metadata is queried for the given sObject. The RecordType Name, DeveloperName, and Id are displayed.

EXAMPLES
  $ sf raven object display recordtypes --target-org dev --sobject Account

  $ sf raven object display recordtypes --target-org dev --sobject My_Custom_Object__c


OUTPUT

Name                Developer Name          Id
─────────────────── ─────────────────────── ──────────────────
Business Account    Business_Account        0124J000000XXXXABC
Person Account      PersonAccount           0124J000000YYYYDEF
...
```

## sf raven audit display

Show recent entries in the Setup Audit Trail.

```
USAGE
  $ sf raven audit display -o <value> [--json] [-u <value>] [-l <value>]

FLAGS
  -l, --limit=<value>       [default: 20] The number of audit trail entries to return. Maximum is 2000.
  -o, --target-org=<value>  (required) Login username or alias for the target org.
  -u, --username=<value>    Username to filter the audit trail by.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Show recent entries in the Setup Audit Trail.

  Returns the 20 most recent Setup Audit Trail entries, but this can be increased up to 2000 using the optional --limit flag. The results can be filtered by a particular user using the --username flag.

EXAMPLES
  $ sf raven audit display --target-org dev

  $ sf raven audit display --target-org dev --limit 200

  $ sf raven audit display --target-org dev --username username@salesforce.com.dev

  $ sf raven audit display --target-org dev --limit 50 --username username@salesforce.com.dev


OUTPUT

Date                Username      Type         Action                                                      Delegate User
─────────────────── ───────────── ──────────── ─────────────────────────────────────────────────────────── ────────────────────
2023-09-29 17:23:47 user@dev.com  Apex Trigger Changed Account Created Trigger code: AccountTrigger        null
2023-09-29 17:23:43 user@dev.com  Apex Trigger Created Account Created Trigger code: AccountCreatedTrigger null
...
```

## sf raven event subscribe

Subscribe to Platform Events.

```
USAGE
  $ sf raven event subscribe -o <value> -e <value> [--json] [-r <value>] [-t <value>]

FLAGS
  -e, --event=<value>       (required) The name of the Platform Event that you want to subscribe with '/event/' prefix eg. /event/My_Event__e.
  -o, --target-org=<value>  (required) Login username or alias for the target org.
  -r, --replayid=<value>    The replay id to replay events from eg. 21980378.
  -t, --timeout=<value>     [default: 3] How long to subscribe for before timing out in minutes eg. 10. Default is 3 minutes.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Subscribe to Platform Events.

  Platform Events are printed to the terminal. An optional flag can be used to relay events from a given relayid. Defaut timeout is 3 minutes, but can be extended to 30 minutes.

EXAMPLES
  $ sf raven event subscribe --target-org dev --event /event/My_Event__e

  $ sf raven event subscribe --target-org dev --event /event/My_Event__e --replayid 21980378

  $ sf raven event subscribe --target-org dev --event /event/My_Event__e --timeout 10

  $ sf raven event subscribe --target-org dev --event /event/My_Event__e --replayid 21980378 --timeout 10


OUTPUT

❯ 🔌 Connecting to org... done
❯ 📡 Listening for events...

{
  "schema": "XdDXhymeO5NOxuhzFpgDJA",
  "payload": {
    "Some_Event_Field__c": "Hello World",
    "CreatedDate": "2021-03-15T19:16:54.929Z",
  },
  "event": {
    "replayId": 21980379
  }
}
```

<!-- ## sfdx raven:utils:deploy:branch2org

Deploys a git branch to an org. Assumes you have git installed the neccessary access to the repo you are trying to clone (eg. you can run `git clone ...`), and that the branch is in a source-format sfdx project structure.

```
USAGE
  $ sfdx raven:utils:deploy:branch2org

OPTIONS
  -u, --targetusername
      (required) sets a username or alias for the target org that you wish to deploy to. overrides the default target org.

  -r, --repository
      (required) URL of the repo. It can either be an HTTPs URL (eg. 'https://github.com/user/some-repo.git') and you
      will be prompted to enter a username and password, or an SSH URL (eg. 'git@github.com:user/some-repo.git')
      which assumes you have SSH keys configured for this repo.

  -b, --branch
      (required) the branch you wish to deploy

  -c, --checkonly
      (optional) Validates the deployed metadata and runs all Apex tests, but prevents the
      deployment from being saved to the org.

  -h, --help
      show CLI help

  --json
      format output as json

  --loglevel              l
      ogging level for this command invocation

EXAMPLE
  $ sfdx raven:utils:deploy:branch2org -r git@github.com:user/some-repo.git -b branchName -u orgName`
  or
  $ sfdx raven:utils:deploy:branch2org -r https://github.com/user/some-repo.git -b branchName -u orgName`


OUTPUT

❯ Cloning repo & checking out 'branchName'... done
❯ Converting from source format to metadata format... done
❯ Initiating deployment... done

❯ The deployment has been requested with id: 0Af4K00000BHVuAXXX

❯ Deployment InProgress (0/31) Processing Type: CustomObject
❯ Deployment InProgress (21/31) Processing Type: CustomTab
❯ Deployment InProgress (30/31) Processing Type: Profile
❯ Deployment Succeeded

❯ Link to deployment page in Salesforce:
https://wise-hawk-22uzds-dev-ed.my.salesforce.com/lightning/setup/DeployStatus/page?address=%2Fchangemgmt%2FmonitorDeploymentsDetails.apexp%3FasyncId%3D0Af4K00000BHVuASAX
```

## sfdx raven:utils:diff

Allows you to quickly compare metadata of files between two orgs. Intended to be used for quick compares of single
(or possibly a few) files of the same metadata type, rather than a full org compare (there are better tools for
that) The results are stored in a diff_{timestamp}.html file wherever you run the command from, and automatically
opened in a browser.

```
USAGE
  $ sfdx raven:utils:diff -s <string> -t <string> -o <string> -i <string> [--filename <string>] [-f <string>]
  [--silent] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -f, --format=format
      (optional) Format of the diff. Options are 'line' (inline diff) or 'side' (side-by-side diff). Defaults to 'line'

  -i, --items=items
      (required) The items you wish to compare eg. MyCoolClass or Account. Can be multiple items comma delimted eg.
      MyClass,MyController or Account,Opportunity (but can only be of one 'type')

  -o, --type=type
      (required) The type of metadata you want to compare eg. ApexClass or CustomObject

  -s, --source=source
      (required) Alias / Username of the org you want to use as the SOURCE of the diff eg. projectDev

  -t, --target=target
      (required) Alias / Username of the org you want to use as the TARGET of the diff eg. projectQA

  --filename=filename
      (optional) The filename of the diff.html. Defaults to diff_{timestamp}.html

  --json
      format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)
      [default: warn] logging level for this command invocation

  --silent
      use this to not auto open browser with results

EXAMPLES
  $ sfdx raven:utils:diff --source dev_org --target qa_org --type CustomObject --items Account
  $ sfdx raven:utils:diff --source dev_org --target qa_org --type CustomObject --items 'Account,Opportunity'
  $ sfdx raven:utils:diff --source dev_org --target qa_org --type ApexClass --items MyClass
  $ sfdx raven:utils:diff --source dev_org --target qa_org --type ApexClass --items 'MyClass,MyTestClass,MyController
  $ sfdx  raven:utils:diff -s dev_org -t qa_org -o CustomObject -i 'Account'
  $ sfdx  raven:utils:diff -s dev_org -t qa_org -o ApexClass -i 'MyClass'
  $ sfdx  raven:utils:diff -s dev_org -t qa_org -o ApexClass -i 'MyClass' --silent

OUTPUT

❯ sfdx raven:utils:diff --source trailhead --target dev --type ApexClass --items 'HelloWorld'
🗂️  Building package.xml... done
⏬ Retrieving from trailhead... done
⏬ Retrieving from dev... done
📂 Unzipping metadata... done
👨‍🍳 Preparing diff... done
✨ Cleaning up... done
🌐 Opening with diff2html in browser... done
```
<img width="795" alt="diff" src="https://user-images.githubusercontent.com/1554713/111902572-057edf80-8a36-11eb-8c45-56c09c290e89.png">


## sfdx raven:utils:dashboarduser:update

Updates the "Running User" of Dashboards from a given user, to an alternate given user. Useful for mass-updating Dashboards when a user is deactivated.

You will have the following additional options when running -

* A list of Dashboards that will be affected as part of the script will be displayed, with the option to abort if desired.
* The final step to deploy the changes back to the org can be skipped when prompted, allowing for the manual deploy of the patched metadata files - this might be desirable when running against Production environments with strict deployment practices, or if you maintain Dashboard metadata in source control and want to commit the files.

```
USAGE
  $ sfdx raven:utils:dashboarduser:update

OPTIONS
  -u, --targetusername
      (required) sets a username or alias for the target org. overrides the default target org.

  -f, --from
      (required) the username of the user which is currently the 'running user' of the Dashboards eg. 'tom.carman@ecorp.com'

  -t, --to.
      (required) the username of the user which you want to make the new 'running user' of the Dashboards eg. 'james.moriarty@ecorp.com'

  -h, --help
      show CLI help

  --json
      format output as json

  --loglevel
      logging level for this command invocation

EXAMPLE
  $ sfdx raven:utils:dashboarduser:update -u ecorp-dev --from tom.carman@ecorp.com --to james.moriarty@ecorp.com`
``` -->
