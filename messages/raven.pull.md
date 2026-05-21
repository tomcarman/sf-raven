# summary

Pull Salesforce metadata into the local project.

# description

Refresh local Salesforce metadata from an authenticated org. Without --all, local metadata paths are loaded into fzf so you can choose a specific file or directory to retrieve. With --all, each package directory from sfdx-project.json is retrieved.

# examples

Retrieve a selected local metadata path from the default org:

<%= config.bin %> <%= command.id %>

Retrieve a selected local metadata path from a specific org:

<%= config.bin %> <%= command.id %> --target-org dev

Retrieve all local package directories from the default org:

<%= config.bin %> <%= command.id %> --all

Retrieve all local package directories from a specific org:

<%= config.bin %> <%= command.id %> --target-org dev --all

# flags.target-org.summary

Login username or alias for the target org. Uses the default org when omitted.

# flags.all.summary

Retrieve all local package directories instead of selecting a path with fzf.

# info.retrieveStarting

Retrieving source: %s

# error.noMetadataPaths

No local metadata paths were found to retrieve.

# error.noSelection

No metadata path was selected.

# error.retrieveFailed

sf project retrieve start failed with exit code %s.

# error.commandNotFound

Could not run %s. Make sure it is installed and available on your PATH.
