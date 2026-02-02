import json
import boto3
from decimal import Decimal

client = boto3.client('dynamodb')
dynamodb = boto3.resource("dynamodb")
tableName = 'restaurant-app-db'
table = dynamodb.Table(tableName)

def lambda_handler(event, context):
    # print('Event', event)
    restaurantId = event['rawQueryString'].replace("id=", "")
    body = {}
    statusCode = 200
    headers = {
        "Content-Type": "application/json"
    }

    try:
        body = table.scan()
        body = body["Items"]
        print("ITEMS----")
        print(body)
        responseBody = []
        for items in body:
            if items['restaurant-id'] == restaurantId:
                responseItems = [
                    {'id': items['id'], 'title': items['title'], 'price': items['price']}]
                responseBody.append(responseItems)
        body = responseBody
    except KeyError:
        statusCode = 400
        body = 'Unsupported route: ' + event['routeKey']
    body = json.dumps(body)
    res = {
        "statusCode": statusCode,
        "headers": {
            "Content-Type": "application/json"
        },
        "body": body
    }
    return res