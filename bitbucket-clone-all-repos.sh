#!/usr/bin/env bash
#!/usr/bin/env bash
#Author Va Nuwa

#Bitbucket credentials
user_name='<username>'
user_password='<password>'
team='<teamname>'

# directories and file names
fname=`date +%F_%H_%M`
clone_location="./tmp/bitbucket" # where to clone

pwd
whoami
mkdir -p ${clone_location}
cd ${clone_location}
pwd

# team repositories
api_url="https://api.bitbucket.org/2.0/teams/${team}/repositories"
echo ${api_url}
content=$(curl --user ${user_name}:${user_password} ${api_url})

echo ${content}

get_repositories_urls () {
#remove previous urls file
rm -f bitbucketurls

# user repositories
#curl --user ${user_name}:${user_password} https://api.bitbucket.org/2.0/users/${user_password}repositories > bitbucket.1

# team repositories
api_url="https://api.bitbucket.org/2.0/teams/${team}/repositories"
echo ${api_url}
content=$(curl --user ${user_name}:${user_password} ${api_url})

echo ${content}


# parsing
#tr , '\n' < bitbucket.1 > bitbucket.2
#tr -d '"{}[]' < bitbucket.2 > bitbucket.3

#Processing
#cat bitbucket.3 |grep -i uri |cut -d":" -f2 >bitbucket.4
#sed 's/\/1\.0\/repositories\///g' bitbucket.4 > bitbucket.5
#cat bitbucket.5 |grep ${user_name} > bitbucket.6

#make it a gir utl
#for i in `cat bitbucket.6` ;do
#echo "git@bitbucket.org:$i.git" >> bitbucketurls
#rm -f bitbucket.*
#done
}

bb_backup () {
rm -rf `cat VERSION`
echo ${fname} > VERSION
mkdir ${fname}
cd ${fname}

#bare clone
for repo in `cat ../bitbucketurls` ; do
echo "========== Cloning ${repo} =========="
git clone --bare ${repo}
done
}

#Cloning starts here
get_repositories_urls
#bb_backup

exit 0
