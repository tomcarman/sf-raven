# summary

Show field information for a given sObject.

# description

FieldDefinition metadata is queried for the given sObject. The field Labels, API names, and Type are displayed.

# flags.target-org.summary

Login username or alias for the target org.

# flags.sobject.summary

The API name of the sObject that you want to view fields for. Use a comma-delimited list to query multiple objects.

# flags.csv.summary

Path to write field information as CSV. When supplied, table output is suppressed.

# info.csvWritten

Wrote %s fields to %s.

# examples

- <%= config.bin %> <%= command.id %> --target-org dev --sobject Account

- <%= config.bin %> <%= command.id %> --target-org dev --sobject My_Custom_Object\_\_c

- <%= config.bin %> <%= command.id %> --target-org dev --sobject Account,Contact

- <%= config.bin %> <%= command.id %> --target-org dev --sobject Account --csv account-fields.csv
