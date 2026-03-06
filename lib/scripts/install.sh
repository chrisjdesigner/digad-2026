#!/bin/bash

# Parse a YAML file and print out the variables
# https://stackoverflow.com/a/21189044
function parse_yaml {
   local prefix=$2
   local s='[[:space:]]*' w='[a-zA-Z0-9_]*' fs=$(echo @|tr @ '\034')
   sed -ne "s|^\($s\):|\1|" \
        -e "s|^\($s\)\($w\)$s:$s[\"']\(.*\)[\"']$s\$|\1$fs\2$fs\3|p" \
        -e "s|^\($s\)\($w\)$s:$s\(.*\)$s\$|\1$fs\2$fs\3|p"  $1 |
   awk -F$fs '{
      indent = length($1)/2;
      vname[indent] = $2;
      for (i in vname) {if (i > indent) {delete vname[i]}}
      if (length($3) > 0) {
         vn=""; for (i=0; i<indent; i++) {vn=(vn)(vname[i])("_")}
         printf("%s%s%s=\"%s\"\n", "'$prefix'",vn, $2, $3);
      }
   }'
}

FRONTEND_DIR=$(pwd)

# find the closest package.json file in parent directories
PACKAGE_JSON=$(while [[ "$PWD" != "/" && ! -e package.json ]]; do cd ..; done; echo "$PWD/package.json")


# if we can't find a package.json file, exit
if [ -z "$PACKAGE_JSON" ]; then
  echo -e "\n\033[1;31mNo package.json file found. Exiting...\033[0m\n"
  exit 1;

# otherwise, we have a package.json file
else
  echo -e "\n\033[1;32mFound package.json file: $PACKAGE_JSON\033[0m\n"

  # get the directory of the package.json file
  FRONTEND_DIR=$(dirname "$PACKAGE_JSON")

  # if the directory doesn't exist, exit
  if [ ! -d "$FRONTEND_DIR" ]; then
    echo -e "\n\033[1;31mDirectory $FRONTEND_DIR does not exist. Exiting...\033[0m\n"
    exit 1;
  fi

  # generic fixperms
  sudo sr-fix-perms "$FRONTEND_DIR"
fi

#
# Make sure pnpm packages are installed
#

PNPM_OWNER=$(whoami)

# Check if existing pnpm packages are installed.
if [ -f "$FRONTEND_DIR/node_modules/.modules.yaml" ]; then
  echo -e "\n\033[1;32mChecking if PNPM node_modules exists..\033[0m\n"

  # Read and parse the YAML file, find the `storeDir`
  eval $(parse_yaml "$FRONTEND_DIR/node_modules/.modules.yaml" "PNPM_MODULES_")

  # if `$PNPM_MODULES_storeDir` exists and isn't empty, print it
  if [ ! -z "$PNPM_MODULES_storeDir" ]; then
    # Get the "user" portion of this value. This will be in the pattern of `/home/<user>/.local/share/pnpm/store/v3`
    PNPM_MODULES_USER=$(echo "$PNPM_MODULES_storeDir" | cut -d'/' -f3)

    PNPM_OWNER="$PNPM_MODULES_USER"

  fi
fi

# If node_modules already exists, fix permissions.
if [ -d "$FRONTEND_DIR/node_modules" ]; then
  echo -e "\n\033[1;32mSetting permissions on node_modules...\033[0m\n"
  sudo chown -R "$PNPM_OWNER:$PNPM_OWNER" "$FRONTEND_DIR/node_modules"
fi

# Run pnpm install as the correct user
echo -e "\n\033[1;32mRunning pnpm install as $PNPM_OWNER...\033[0m\n"
sudo -u "$PNPM_OWNER" pnpm install --dir="$FRONTEND_DIR"

# Fix permissions again.
sudo chown -R "$PNPM_OWNER:$PNPM_OWNER" "$FRONTEND_DIR/node_modules"

# Find all folders matching the pattern /^[0-9]*x[0-9]*(-[a-zA-Z0-9]*)?/
FOLDERS=$(find "$FRONTEND_DIR" -maxdepth 1 -type d -regex '.*/[0-9]*x[0-9]*\(-[a-zA-Z0-9]*\)?')

# Fix permissions on the above folders
for FOLDER in $FOLDERS; do
  echo -e "\n\033[1;32mSetting permissions on $FOLDER...\033[0m\n"
  sudo chown -R "$PNPM_OWNER:$PNPM_OWNER" "$FOLDER"
done
