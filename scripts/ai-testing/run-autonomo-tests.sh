#!/bin/bash

# Simple YAML parser and runner for autonomo-tests.yml
# This is a simplified version of the runner for autonomo.yml

set -e

YAML_FILE="/home/edu/Autamedica/scripts/ai-testing/autonomo-tests.yml"
AGENT_ID=$1
shift
AGENT_ARGS=$@

if [ -z "$AGENT_ID" ]; then
  echo "Usage: $0 <agent_id> [agent_args]"
  echo "Available agents:"
  yq '.agents[].id' $YAML_FILE
  exit 1
fi

echo "Running agent: $AGENT_ID"

# Find the agent in the YAML file
AGENT_JSON=$(yq ".agents[] | select(.id == \"$AGENT_ID\")" $YAML_FILE)

if [ -z "$AGENT_JSON" ]; then
  echo "Agent '$AGENT_ID' not found in $YAML_FILE"
  exit 1
fi

# Get the actions for the agent
ACTIONS=$(echo "$AGENT_JSON" | yq '.actions[].run')

# Execute the actions
for action in $ACTIONS; do
  # Replace placeholders with arguments
  COMMAND=$(echo "$action" | sed "s#<ruta_del_archivo>#$AGENT_ARGS#g")
  echo "Executing: $COMMAND"
  eval $COMMAND
done

echo "Agent '$AGENT_ID' finished successfully."