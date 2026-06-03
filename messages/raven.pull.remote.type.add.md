# summary

Add metadata types supported by remote pull.

# description

List metadata types available in the target org and select one or more to add to this project's `sf raven pull remote` configuration. Press Tab to select multiple types in fzf, then Enter to save them.

# examples

Add metadata types from the default org:

<%= config.bin %> <%= command.id %>

Add metadata types from a specific org:

<%= config.bin %> <%= command.id %> --target-org dev

# flags.target-org.summary

Login username or alias for the target org. Uses the default org when omitted.

# info.loadingOrgMetadataTypes

Loading org metadata types...

# info.noAvailableMetadataTypes

All org metadata types are already supported by remote pull.

# info.noSelection

No metadata types were selected.

# info.addedMetadataTypes

Added metadata types: %s

# error.noOrgMetadataTypes

No metadata types were returned from the org.
