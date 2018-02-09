bash scripts/autoPull.sh &&
echo "Currently in " $PWD

cp -r ../polymath-core/contracts . &&
echo "Copied polymath-core contracts into polymath.js"

rm -rf build/contracts
echo "Removed build/contracts directory"
