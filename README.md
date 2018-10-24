# mysqldump archive

This is a lambda script that is designed to run when new files are `PUT`
into a S3 bucket.  Oldest file is put in a seperate S3 bucket location.


## Build status

* `master`: ![travis-ci build of
master](https://travis-ci.org/sohmc/mysqldump-archive.svg?branch=master)

## Licenses

This repository is hereby released under the [GPLv3 License](LICENSE).

I follow a strict "It works for me, YMMV" support SLA.  You are welcome
to log issues but there is no guarentee that I will read them or solve
them.
