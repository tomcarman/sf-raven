# summary

Show Validation Rule information for a given sObject.

# description

Validation Rules are queried for the given sObject. The rule Name, Active status, Description, and Error Message are displayed.

# flags.target-org.summary

Login username or alias for the target org.

# flags.sobject.summary

The API name of the sObject to view Validation Rules for. Use a comma-delimited list to query multiple objects.

# flags.csv.summary

Path to write Validation Rule information as CSV. When supplied, table output is suppressed.

# flags.active.summary

Only show active validation rules.

# info.csvWritten

Wrote %s validation rules to %s.

# examples

- <%= config.bin %> <%= command.id %> --target-org dev --sobject Account

- <%= config.bin %> <%= command.id %> --target-org dev --sobject My_Custom_Object\_\_c

- <%= config.bin %> <%= command.id %> --target-org dev --sobject Account,Contact

- <%= config.bin %> <%= command.id %> --target-org dev --sobject Account --csv account-validation-rules.csv
