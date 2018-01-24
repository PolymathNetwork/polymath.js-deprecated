cd ../polymath-core

current_branch() {
    git rev-parse --abbrev-ref HEAD
}

branch=$(current_branch)
master="master"

if [[ "$branch" == "$master" ]]
then
    echo "Pulling from " $PWD
    git pull
    echo "Pulled from " $PWD
else
    echo ERROR: Polymath-core is not on the master branch. The contracts may be unstable, please switch to the master branch.
    echo CURRENT BRANCH polymath-core: "$branch"
    exit 1
fi

cd ../polymath.js
