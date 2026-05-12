import {
  PollyClient,
  SynthesizeSpeechCommand,
} from "@aws-sdk/client-polly";

import {
  S3Client,
  PutObjectCommand,
} from "@aws-sdk/client-s3";

import {
  DynamoDBClient,
} from "@aws-sdk/client-dynamodb";

import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
} from "@aws-sdk/lib-dynamodb";

const polly = new PollyClient({
  region: "ap-south-1",
});

const s3 = new S3Client({
  region: "ap-south-1",
});

const dynamo =
  DynamoDBDocumentClient.from(
    new DynamoDBClient({
      region: "ap-south-1",
    })
  );

export const handler = async (event: any) => {

  try {

    const body =
      event.body
        ? JSON.parse(event.body)
        : {};

    // SIGNUP
if (body.action === "signup") {

  await dynamo.send(

    new PutCommand({

      TableName:
        process.env.USERS_TABLE,

      Item: {

        email:
          body.email,

          password:
  body.password,

        createdAt:
          new Date().toISOString(),

      },

    })

  );

  return {

    statusCode: 200,

    headers: {
      "Access-Control-Allow-Origin": "*",
    },

    body: JSON.stringify({

      success: true,

      message:
        "Signup successful",

    }),

  };

}

// LOGIN
if (body.action === "login") {

  const result =
    await dynamo.send(

      new GetCommand({

        TableName:
          process.env.USERS_TABLE,

        Key: {
          email:
            body.email,
        },

      })

    );

  if (!result.Item) {

    return {

      statusCode: 401,

      headers: {
        "Access-Control-Allow-Origin": "*",
      },

      body: JSON.stringify({

        success: false,

        message:
          "User not found",

      }),

    };

  }

  if (
    result.Item.password !==
    body.password
  )
  if (
    result.Item.password !==
    body.password
  ) {
  
    return {
  
      statusCode: 401,
  
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
  
      body: JSON.stringify({
  
        success: false,
  
        message:
          "Wrong password",
  
      }),
  
    };
  
  }

  return {

    statusCode: 200,

    headers: {
      "Access-Control-Allow-Origin": "*",
    },

    body: JSON.stringify({

      success: true,

      message:
        "Login successful",

    }),

  };

}
const text =
body.text ||
"Hello from AWS Polly";

const command =
new SynthesizeSpeechCommand({

  OutputFormat: "mp3",

  Text: text,

  VoiceId: "Joanna",

});

    const response =
      await polly.send(command);

    const audioBuffer =
      Buffer.from(
        await response.AudioStream!
          .transformToByteArray()
      );

    const fileName =
      `audio-${Date.now()}.mp3`;

    await s3.send(

      new PutObjectCommand({

        Bucket:
          process.env.BUCKET_NAME,

        Key: fileName,

        Body: audioBuffer,

        ContentType: "audio/mpeg",

      })

    );

    const audioUrl =
      `https://${process.env.BUCKET_NAME}.s3.ap-south-1.amazonaws.com/${fileName}`;

    // SAVE TO DYNAMODB
    await dynamo.send(

      new PutCommand({

        TableName:
          process.env.TABLE_NAME,

        Item: {

          id:
            Date.now().toString(),

          text,

          audioUrl,

          createdAt:
            new Date().toISOString(),

        },

      })

    );

    return {

      statusCode: 200,

      headers: {

        "Access-Control-Allow-Origin": "*",

        "Access-Control-Allow-Headers": "*",

        "Access-Control-Allow-Methods": "*",

      },

      body: JSON.stringify({

        success: true,

        audioUrl,

      }),

    };

  } catch (error: any) {

    return {

      statusCode: 500,

      headers: {

        "Access-Control-Allow-Origin": "*",

      },

      body: JSON.stringify({

        error: error.message,

      }),

    };

  }

};