import json
import os
import math
import time
import logging
import boto3
import random
from botocore.vendored import requests
from aws_requests_auth.aws_auth import AWSRequestsAuth
from elasticsearch import Elasticsearch, RequestsHttpConnection
import random

host = 'search-assignment-3-embfkaeetlkbbmtru7xvvuca5i.us-west-2.es.amazonaws.com'
region = 'us-west-2'

def search_elasticsearch(term):
    credentials = boto3.Session().get_credentials()

    awsauth = AWSRequestsAuth(
        aws_access_key=credentials.access_key,
        aws_secret_access_key=credentials.secret_key,
        aws_token=credentials.token,
        aws_host=host,
        aws_region=region,
        aws_service='es'
    )

    es = Elasticsearch(
        hosts = [{'host': host, 'port': 443}],
        http_auth = awsauth,
        use_ssl = True,
        verify_certs = True,
        connection_class = RequestsHttpConnection
    )

    es_index = 'images'
    try:
        resp = es.search(index=es_index, q=term)
        print(resp)

        return resp['hits']['hits'][0]['_id']
    except:
        return None


def lambda_handler(event, context):
    print(event)
    text = event['queryStringParameters']['q']
    print(text)
    client = boto3.client('lex-runtime')
    randomId = str(random.randint(0,2000))
    response = client.post_text(
        botName='photoSearch',
        botAlias='photos_search',
        userId=randomId,
        inputText='Hi'
    )
    
    response = client.post_text(
        botName='photoSearch',
        botAlias='photos_search',
        userId=randomId,
        inputText=text
    )
    
    print('**response**')
    print(response)
    labels = []
    responseText = response['slots']['Animal']

    if responseText and 'and' in responseText:
        labels = responseText.split('and')
    elif responseText:
        labels = responseText.split()
    
    labels = [i.strip() for i in labels]
    print(labels)
    # OUTPUT LIST
    output = []
    
    for label in labels:
        print(search_elasticsearch(label))
        result = search_elasticsearch(label)
        if result:
            output.append(result)
    
    print(output)
    
    bucket = 'assignment3-imagebucket-n5dmftkngpz0'
    img_array = []
    for i in output:
        if i:
            img_url= "https://" + bucket + ".s3.amazonaws.com/" + i
            img_array.append(img_url)
        
    if output:
        print("first")
        response = {
            'statusCode': 200,
            'headers':{
                'Access-Control-Allow-Origin':'*',
                'Access-Control-Allow-Headers':'*',
                "Access-Control-Allow-Methods": "OPTIONS,GET"
            },
            'body': json.dumps({
                "results":img_array
            })
        }
    else:
        print("second")
        response = {
            'statusCode': 200,
            'headers':{
                'Access-Control-Allow-Origin':'*',
                'Access-Control-Allow-Headers':'*',
                "Access-Control-Allow-Methods": "OPTIONS,GET"
                
            },
            'body':  json.dumps({ "results": []})
        }
    #logger.debug('event.bot.name={}'.format(event['bot']['name']))
    print(response)
    return response
    
