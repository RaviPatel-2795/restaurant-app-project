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
        if event['routeKey'] == "DELETE /restaurant-app-crud-functions/{id}":
            print("DELETEITEM----")
            table.delete_item(
                Key={'id': event['pathParameters']['id']})
            body = 'Deleted item ' + event['pathParameters']['id']
        elif event['routeKey'] == "GET /restaurant-app-crud-functions":
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
        elif event['routeKey'] == "PUT /restaurant-app-crud-functions":
            requestJSON = json.loads(event['body'])
            print("PUTITEMS----")
            table.put_item(
                Item={
                    'id': requestJSON['id'],
                    "restaurant-id": requestJSON['restaurant-id'],
                    "title": requestJSON['title'],
                    "price": requestJSON['price']
                })
            body = 'Put item ' + requestJSON['id']
        elif event['routeKey'] == "PATCH /restaurant-app-crud-functions/{id}":
            print("PUTITEMS----", event['pathParameters']['id'])
            requestJSON = json.loads(event['body'])
            table.update_item(
                Key={'id': event['pathParameters']['id']},
                UpdateExpression="SET price=:p",
                ExpressionAttributeValues={
                    ':p': requestJSON['price']
                },
                ReturnValues="UPDATED_NEW"
            )
            body = 'Updated item ' + event['pathParameters']['id']
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