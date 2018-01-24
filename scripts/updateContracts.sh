cd ../polymath-core/scripts &&
echo "Now in" $PWD

bash autoPull.sh &&

cd ../../polymath.js &&
echo "Now in" $PWD

cp -r ../polymath-core/contracts . &&
echo "Copied polymath-core contracts into polymath.js"

rm -rf build
echo "Removed build directory"
