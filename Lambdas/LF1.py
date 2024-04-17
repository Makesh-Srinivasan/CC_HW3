
import json
import boto3
import base64
from aws_requests_auth.aws_auth import AWSRequestsAuth
from elasticsearch import Elasticsearch
import time
from requests_aws4auth import AWS4Auth
import requests


def lambda_handler(event, context):
    print(event)
    s3info=event['Records'][0]['s3']
    bucketname=event['Records'][0]['s3']['bucket']['name']
    image=event['Records'][0]['s3']['object']['key']
    print("bucket that invoked:", bucketname)
    print(image)
    
    # Initializing an S3 client
    s3obj = boto3.client('s3')
    getobj=s3obj.get_object(Bucket=bucketname,Key=image)
    body=getobj['Body'].read()

    
    headobj=s3obj.head_object(Bucket=bucketname,Key=image) # here, fetching metadd ata headers of the image object
    
    print("headers",headobj['ResponseMetadata']['HTTPHeaders'])
    
    rkclient = boto3.client('rekognition', region_name='us-east-1') #Rekognition client
    
    response = rkclient.detect_labels(Image={'Bytes':body}, MaxLabels=5,MinConfidence = 75)
    print("response from rekognition",response)
    
    labels=response['Labels']
    customlabels=[]
    for i in labels:
        customlabels.append(i['Name'])
    timestammp = time.gmtime()
    timecreated = time.strftime("%Y-%m-%dT%H:%M:%S", timestammp)
    customlabels.append(headobj.get('Metadata', {}).get('x-amz-meta-customlabels', '').split(','))

    jsonformatfores={
        'objectKey':image,
        'bucket':bucketname,
        'createdTimeStamp':timecreated,
        'labels':customlabels
    }
    print("customlabels", customlabels)
    
    essearch="https://search-photos-wowdtstjiq4p2ohrltemb2kqja.us-east-1.es.amazonaws.com"
    
    region = "us-east-1"
    service = "es"
    credentials = boto3.Session().get_credentials()
    print("credentials",credentials.access_key, credentials.secret_key, region, service, credentials.token)

    awsauth = AWS4Auth(credentials.access_key, credentials.secret_key, region, service, session_token=credentials.token)
    print("awsauth", awsauth)
    
    essearch=essearch+'/'+'photos'+'/'+'_doc/'+image
    response = requests.post(essearch, auth=awsauth, data=json.dumps(jsonformatfores), headers = { "Content-Type": "application/json" })

    print("request", response)
    print("Response status code:", response.status_code)
    print("Response headers:", response.headers)
    print("Response content:", response.content.decode('utf-8'))
    return {
        'statusCode': 200,
        'body': json.dumps('Hello from Lambda!')
    }
