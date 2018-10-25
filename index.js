console.log('Loading function');
const aws = require('aws-sdk');
const s3 = new aws.S3({ apiVersion: '2006-03-01' });


exports.handler = async (event, context) => {
    console.log('Received event:', JSON.stringify(event, null, 2));

    // Get the object from the event and show its content type
    // const bucket = event.Records[0].s3.bucket.name;
    // const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
    
    var event_record = event.Records[0];

    console.log("Bucket: ", event_record.s3.bucket.name);
    console.log("Event Object: ", event_record.s3.object.key)
  
    console.log("COPY OBJECT: ", "Got the file and about to copy it into latest...");
    const copyParams = {
        CopySource: "/" + event_record.s3.bucket.name + "/" + event_record.key,
        Bucket: event_record.s3.bucket.name,
        Key: event_record.s3.object.key.replace('mysql-backups','mysql-backups/atest'),
        ServerSideEncryption: "AES256"
    };

    console.log('copyParams', copyParams);

    await s3.copyObject(copyParams, function(copyErr, copyData) {
        if (copyErr) console.log(copyErr, copyErr.stack);
        else console.log(copyData);
    }).promise();

    const params = {
        Bucket: copyParams.Bucket,
        Prefix: "mysql-backups/latest",
        StartAfter: "mysql-backups/latest/"
    };

    await s3.listObjectsV2(params, function(err, data) {
        if (err) {
            console.log("error", "There was an error")
            console.log(err, err.stack);
        } else {
            console.log(data)
            console.log("Key Count: ", data.KeyCount)

            for (var i = 0; i < data.KeyCount; i++) {
                var obj = data.Contents[i];
                
                console.log(i, ": " + obj.Key)
                console.log(i, ": " + obj.LastModified)

                if (obj.Key.replace(params.Prefix, 'mysql-backups') != copyParams.Key) {
                    console.log("DELETE: ", "Will delete " + obj.Key)
                }
            }
        }
    }).promise();

    foo("Done");
/*  
    // Use current date and time 
    var oldest_datetime = new Date();
    var oldest_object = null;
   

    if (oldest_object) {    
        const copyParams = {
            CopySource: "/" + params.Bucket + "/" + oldest_object.Key,
            Bucket: "mikesoh.com-galactica-backup",
            Key: oldest_object.Key.replace(params.Prefix, 'mysql-backups'),
            ServerSideEncryption: "AES256"
        };

        console.log('copyParams', copyParams);
        await s3.copyObject(copyParams, function(copyErr, copyData) {
            if (copyErr) console.log(copyErr, copyErr.stack);
            else console.log(copyData);
        }).promise();
    }*/
};

function foo(p) {
    console.log('DEBUG: ', p)
}
