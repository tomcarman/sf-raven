# summary

Find everywhere a field is referenced across the org's metadata.

# description

Queries the MetadataComponentDependency API to find Apex classes, triggers, Flows, and other metadata that references the given custom field.

For full coverage, use --deep. This retrieves FlexiPages, Layouts, and Flows via the Metadata API and text-searches their source, catching declarative references the dependency API does not track (including references to standard fields). The --deep retrieve is slower (typically 15-60s, longer on large orgs).

Standard fields (e.g. Name, CreatedDate) can only be inspected with --deep, as the dependency API does not track them.

# flags.target-org.summary

Login username or alias for the target org.

# flags.sobject.summary

The API name of the sObject the field belongs to.

# flags.field.summary

The API name of the field to inspect.

# flags.deep.summary

Retrieve FlexiPages, Layouts, and Flows and text-search them for references. Slower, but catches declarative references the dependency API misses, and works for standard fields.

# info.loading

Searching for references...

# info.deepLoading

Retrieving metadata for deep search (this may take a while)...

# info.header

References to %s (%s found)

# info.none

  No references found.

# info.caveat

Note: some declarative references (FlexiPages, Layouts) are not tracked by the dependency API. Use --deep for full coverage.

# error.standardFieldNeedsDeep

'%s' is a standard field. The dependency API does not track standard fields — run again with --deep to search FlexiPages, Layouts, and Flows.

# examples

- <%= config.bin %> <%= command.id %> --target-org dev --sobject Account --field MyCustomField__c

- <%= config.bin %> <%= command.id %> --target-org dev --sobject Account --field MyCustomField__c --deep

- <%= config.bin %> <%= command.id %> --target-org dev --sobject Account --field AnnualRevenue --deep
