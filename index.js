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
        CopySource: "/" + event_record.s3.bucket.name + "/" + event_record.s3.object.key,
        Bucket: event_record.s3.bucket.name,
        Key: event_record.s3.object.key.replace('mysql-backups','mysql-backups/latest'),
        ServerSideEncryption: "AES256"
    };

    console.log('copyParams', copyParams);

    await s3.copyObject(copyParams, function(copyErr, copyData) {
        if (copyErr) console.log(copyErr, copyErr.stack);
        else console.log(copyData);
    }).promise();

    console.log("COPY OBJECT: ", "Copy done.");
    console.log("DELETE OBJECT: ", "About to go through the latest folder.");

    const params = {
        Bucket: copyParams.Bucket,
        Prefix: "mysql-backups/latest",
        StartAfter: "mysql-backups/latest/"
    };

    var deleteParams = {
        Bucket: params.Bucket,
        Delete: {
            Objects: [{}]
        },
        Quiet: false
    };

    await s3.listObjectsV2(params, function(err, data) {
        if (err) {
            console.log("error", "There was an error")
            console.log(err, err.stack);
        } else {
            console.log(data)
            console.log("Key Count: ", data.KeyCount)

            var key_list = new Array();
            for (var i = 0; i < data.KeyCount; i++) {
                var obj = data.Contents[i];

                console.log(i, ": " + obj.Key)
                console.log(i, ": " + obj.LastModified)

                console.log(obj.Key, copyParams.Key);
                

                if (obj.Key != copyParams.Key) {
                    console.log("DELETE: ", "Will delete " + obj.Key);

                    deleteParams.Delete.Objects.push({
                        Key: obj.Key
                    });
                }
            }
        }
    }).promise();
   
    if (deleteParams.Delete.Objects.length > 0) {
        console.log('DELETE: ', deleteParams);

        await s3.deleteObjects(deleteParams, function(deleteErr, deleteData) {
            if (deleteErr) console.log(deleteErr, deleteErr.stack);
            else console.log(deleteData);
        }).promise(); 
    }
};

function foo(p) {
    console.log('DEBUG: ', p)
}
