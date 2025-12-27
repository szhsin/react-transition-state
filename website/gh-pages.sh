#!/bin/bash

set -e

check_str=$(pwd | grep "/website")
if [ -z "$check_str" ]; then
    echo "Not in /website"
    exit 1
fi

rm -Rf dist/
npm run build

tmpdir="$HOME/gh-pages"
rm -Rf "$tmpdir"
mkdir "$tmpdir"
mv dist "$tmpdir"
cd ..

git checkout gh-pages
check_str=$(git branch | grep "*" | grep "gh-pages")
if [ -z "$check_str" ]; then
    echo "Not on branch gh-pages"
    exit 1
fi

rm -Rf assets
cp -Rf "$tmpdir/dist/" .
git add .
git commit -m "Updates"
rm -Rf "$tmpdir"
echo "Ready to push gh-pages"
