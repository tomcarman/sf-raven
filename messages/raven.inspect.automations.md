# summary

Show all automation that fires on a given sObject.

# description

Displays Apex Triggers, record-triggered Flows, Workflow Rules, and Process Builder processes that are configured on the given sObject, grouped by execution phase.

By default only active automation is shown. Use --all to include inactive items.

# flags.target-org.summary

Login username or alias for the target org.

# flags.sobject.summary

The API name of the sObject to inspect.

# flags.all.summary

Include inactive automation. Active items display normally, inactive items are dimmed with an Active indicator.

# info.loading

Loading automation...

# info.header

Automation on %s (%s)

# info.none

No automation found.

# info.unorderedFlows

Note: flows without an explicit Trigger Order (blank Order column) run in an unpredictable sequence relative to each other.

# examples

- <%= config.bin %> <%= command.id %> --target-org dev --sobject Account

- <%= config.bin %> <%= command.id %> --target-org dev --sobject Account --all

- <%= config.bin %> <%= command.id %> --target-org dev --sobject Opportunity
