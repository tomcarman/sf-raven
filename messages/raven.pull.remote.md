# summary

Pull Salesforce metadata that exists in the org but not locally.

# description

Select a configured metadata type, then list components of that type that exist in the target org but are not present in the local project. Org-only components are prefixed with a cloud marker in fzf. Press Tab to select multiple components, then Enter to retrieve them.

# examples

Retrieve selected remote-only metadata from the default org:

<%= config.bin %> <%= command.id %>

Retrieve selected remote-only metadata from a specific org:

<%= config.bin %> <%= command.id %> --target-org dev

# flags.target-org.summary

Login username or alias for the target org. Uses the default org when omitted.

# info.loadingRemoteMetadata

Loading remote metadata...

# info.noRemoteMetadata

No remote-only %s metadata was found.

# info.retrieveStarting

Retrieving remote metadata: %s

# info.noSelection

No remote metadata was selected.

# info.noTypeSelection

No metadata type was selected.

# prompt.selectMetadataType

Select a metadata type to inspect.

# error.noMetadataTypes

No supported remote metadata types were found. Run `sf raven pull remote type add` to add types from an org.

# error.noSelection

No remote metadata was selected.

# error.retrieveFailed

sf project retrieve start failed with exit code %s.
