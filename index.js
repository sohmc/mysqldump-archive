console.log('Loading function');
const aws = require('aws-sdk');
const s3 = new aws.S3({ apiVersion: '2006-03-01' });


exports.handler = async (event, context) => {
    //console.log('Received event:', JSON.stringify(event, null, 2));

    // Get the object from the event and show its content type
    // const bucket = event.Records[0].s3.bucket.name;
    // const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
    const params = {
        Bucket: "mikesoh.com-galactica-backup",
        Prefix: "mysql-backups/latest",
        StartAfter: "mysql-backups/latest/"
    };
    
    console.log("Bucket: ", params.Bucket)
    console.log("Event Object: ", event.Records[0].s3.object.key)
    
    // Use current date and time 
    var oldest_datetime = new Date();
    var oldest_object = null;
    
    await s3.listObjectsV2(params, function(err, data) {
        if (err) {
            console.log("error", "There was an error")
            console.log(err, err.stack);
        } else {
            console.log(data)
            console.log("Key Count: ", data.KeyCount)

            // If there is more than one file, then loop through.
            if (data.KeyCount > 1) {
                for (var i = 0; i < data.KeyCount; i++) {
                    var obj = data.Contents[i];
                    
                    console.log(i, ": " + obj.Key)
                    console.log(i, ": " + obj.LastModified)
                    
                    if (oldest_datetime >= obj.LastModified) {
                        console.log(i, ": found older object");
                        oldest_datetime = obj.LastModified;
                        oldest_object = obj
                    }
                }

                const copyParams = {
                    CopySource: "/" + params.Bucket + "/" + oldest_object.Key,
                    Bucket: "mikesoh.com-galactica-backup",
                    Key: oldest_object.Key.replace(params.Prefix, 'mysql-backups')
                    ServerSideEncryption: "AES256"
                };
            
                console.log('copyParams', copyParams);
                await s3.copyObject(copyParams, function(copyErr, copyData) {
                    if (err) console.log(err, err.stack);
                    else console.log(data);
                }).promise;
            } else {
                console.log("No oldest object but the event object.")
            }
        }
    }).promise();
    
};
