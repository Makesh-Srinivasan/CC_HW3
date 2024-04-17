console.log('testing')

function getPhotos() {
    var apigClient = apigClientFactory.newClient({
        apiKey: 'RmtJet7UpR9lfdvrJzkLIaer5QBqNOs68i5Tj3Y7',
    });
    var inputText = document.getElementById('textInput').value;
    var params = {
        q: inputText
    }

    // var linksContainer = document.getElementById('photoLinks');
    // linksContainer.innerHTML = '';

    // apigClient.searchGet(params).then(response => {
    //     filePaths = response["data"]["imagePaths"];

    //     if (filePaths.length < 1) {
    //         linksContainer.innerText = 'No Images found';
    //     };

    //     filePaths.forEach(path => {
    //         var a = document.createElement('a');
    //         linksContainer.innerHTML += '<img src="https://newpythonl.s3.amazonaws.com/' + path + '" style="width:50%">';
    //     });
    // });
    var body = {};
    var additionalParams = {
        headers: {
            'Content-Type': "application/json"
        }
    };
    apigClient.searchGet(params, body, additionalParams).then(function (res) {
        var data = {}
        var data_array = []
        resp_data = res.data
        length_of_response = resp_data.length;
        if (length_of_response == 0) {
            document.getElementById("displaytext").innerHTML = "No Images Found !!!"
            document.getElementById("displaytext").style.display = "block";

        }

        resp_data.forEach(function (obj) {

            var img = new Image();
            img.src = "https://s3.amazonaws.com/photoboy/" + obj;
            img.setAttribute("class", "banner-img");
            img.setAttribute("alt", "effy");
            document.getElementById("displaytext").innerHTML = "Images returned are : "
            document.getElementById("img-container").appendChild(img);
            document.getElementById("displaytext").style.display = "block";

        });
    }).catch(function (result) {

    });
}

// function getBase64(file) {
//     return new Promise((resolve, reject) => {
//         const reader = new FileReader();
//         reader.readAsDataURL(file);
//         reader.onload = () => resolve(reader.result);
//         reader.onerror = error => reject(error);
//     });
// }
function getBase64(file) {
    return new Promise((resolve, reject) => {
        if (!file) {
            reject('No file input');
        }
        console.log(file);
        const reader = new FileReader();
        reader.readAsDataURL(file);
        // reader.onload = () => resolve(reader.result)
        reader.onload = () => {
            let encoded = reader.result.replace(/^data:(.*;base64,)?/, '');
            if ((encoded.length % 4) > 0) {
                encoded += '='.repeat(4 - (encoded.length % 4));
            }
            resolve(encoded);
        };
        reader.onerror = error => reject(error);
    });
}


function uploadPhoto() {

    // const fileInput = document.getElementById('photoUpload');
    const customLabels = JSON.stringify(document.getElementById('labelInput').value.split(' '));

    // const file = fileInput.files[0];
    // const fileName = file.name;

    // const formData = new FormData();
    // formData.append('file', file);

    // const apiEndpoint = 'https://k5dntusqr3.execute-api.us-east-1.amazonaws.com/test1/upload/' + fileName;

    // // Create custom headers
    // const headers = new Headers({
    //     'x-amz-meta-customLabels': customLabels,
    //     'Content-type': file.type
    // });

    // // Use fetch to make the PUT request
    // fetch(apiEndpoint, {
    //     method: 'PUT',
    //     body: formData,
    //     headers: headers
    // }).then(res => {
    //     if (res.status === 200) {
    // console.log('Success OK');
    // alert("Photo Uploaded Successfully");
    //     } else {
    //         alert("Upload failed");
    //     }
    // });

    var file = document.getElementById('photoUpload').files[0];
    const reader = new FileReader();

    var file_data;
    // var file = document.querySelector('#file_path > input[type="file"]').files[0];
    var encoded_image = getBase64(file).then(
        data => {
            console.log(data)
            var apigClient = apigClientFactory.newClient({
                apiKey: "RmtJet7UpR9lfdvrJzkLIaer5QBqNOs68i5Tj3Y7"
            });

            // var data = document.getElementById('file_path').value;
            // var x = data.split("\\")
            // var filename = x[x.length-1]
            // var file_type = file.type + ";base64"

            var body = data;
            var params = { "filename": file.name, "Content-Type": file.type, "x-amz-meta-customLabels": customLabels };
            var additionalParams = {};
            apigClient.uploadFilenamePut(params, body, additionalParams).then(function (res) {
                console.log(res);
                if (res.status == 200) {
                    // document.getElementById("uploadText").innerHTML = "Image Uploaded  !!!"
                    // document.getElementById("uploadText").style.display = "block";
                    console.log('Success OK');
                    alert("Photo Uploaded Successfully");
                }
            })
        });
}




