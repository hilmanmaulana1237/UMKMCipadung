API Endpoints
Get Started
Things You Should Know
Authentication
All APIs require authentication via Bearer Token.

Authorization: Bearer YOUR_API_KEY

Get API Key:

API Key Management
🔒 Keep your API Key secure

🚫 Do not share it with others

⚡ Reset immediately if compromised

POST
/api/v1/jobs/createTask
Create Task
Create a new generation task

Request Parameters
The API accepts a JSON payload with the following structure:

Request Body Structure
{
  "model": "string",
  "callBackUrl": "string (optional)",
  "input": {
    // Input parameters based on form configuration
  }
}
Root Level Parameters
model
Required
string
The model name to use for generation

Example:

"sora-2-image-to-video"
callBackUrl
Optional
string
Callback URL for task completion notifications. Optional parameter. If provided, the system will send POST requests to this URL when the task completes (success or failure). If not provided, no callback notifications will be sent.

Example:

"https://your-domain.com/api/callback"
Input Object Parameters
The input object contains the following parameters based on the form configuration:

input.prompt
Required
string
The text prompt describing the desired video motion

Max length: 10000 characters
Example:

"A claymation conductor passionately leads a claymation orchestra, while the entire group joyfully sings in chorus the phrase: “Sora 2 is now available on Kie AI."
input.image_urls
Required
array(URL)
URL of the image to use as the first frame. Must be publicly accessible

Please provide the URL of the uploaded file; Accepted types: image/jpeg, image/png, image/webp; Max size: 10.0MB
Example:

["https://file.aiquickdraw.com/custom-page/akr/section-images/17594315607644506ltpf.jpg"]
input.aspect_ratio
Optional
string
This parameter defines the aspect ratio of the image.

Available options:

portrait
-
Portrait
landscape
-
Landscape
Example:

"landscape"
input.n_frames
Optional
string
The number of frames to be generated.

Available options:

10
-
10s
15
-
15s
Example:

"10"
input.remove_watermark
Optional
boolean
When enabled, removes watermarks from the generated video.

Boolean value (true/false)
Example:

true
input.character_id_list
Optional
array(string)
If you want to specify your own characters, create them at https://kie.ai/sora-2?model=sora-2-characters to obtain their character_ids, then enter up to five IDs here to use those characters (if you only need a public character, simply reference it in the prompt with @Name; no ID required).

a character_id remains valid only while its original character_file_urlis active—URLs from our temporary host expire after three days, so you must recreate the character (and use a new ID) once the link expires.
Example:

[ "character_1", "character_2" ]
Request Example

cURL

JavaScript

Python
curl -X POST "https://api.kie.ai/api/v1/jobs/createTask" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "model": "sora-2-image-to-video",
    "callBackUrl": "https://your-domain.com/api/callback",
    "input": {
      "prompt": "A claymation conductor passionately leads a claymation orchestra, while the entire group joyfully sings in chorus the phrase: “Sora 2 is now available on Kie AI.",
      "image_urls": [
        "https://file.aiquickdraw.com/custom-page/akr/section-images/17594315607644506ltpf.jpg"
      ],
      "aspect_ratio": "landscape",
      "n_frames": "10",
      "remove_watermark": true,
      "character_id_list": [
        "character_1",
        "character_2"
      ]
    }
}'
Response Example
{
  "code": 200,
  "message": "success",
  "data": {
    "taskId": "task_12345678"
  }
}
Response Fields
code
Status code, 200 for success, others for failure
message
Response message, error description when failed
data.taskId
Task ID for querying task status
Callback Notifications
When you provide the callBackUrl parameter when creating a task, the system will send POST requests to the specified URL upon task completion (success or failure).

Success Callback Example
{
    "code": 200,
    "data": {
        "completeTime": 1755599644000,
        "costTime": 8,
        "createTime": 1755599634000,
        "model": "sora-2-image-to-video",
        "param": "{\"callBackUrl\":\"https://your-domain.com/api/callback\",\"model\":\"sora-2-image-to-video\",\"input\":{\"prompt\":\"A claymation conductor passionately leads a claymation orchestra, while the entire group joyfully sings in chorus the phrase: “Sora 2 is now available on Kie AI.\",\"image_urls\":[\"https://file.aiquickdraw.com/custom-page/akr/section-images/17594315607644506ltpf.jpg\"],\"aspect_ratio\":\"landscape\",\"n_frames\":\"10\",\"remove_watermark\":true,\"character_id_list\":[\"character_1\",\"character_2\"]}}",
        "resultJson": "{\"resultUrls\":[\"https://example.com/generated-image.jpg\"],\"resultWaterMarkUrls\":[\"https://example.com/generated-watermark-image.jpg\"]}",
        "state": "success",
        "taskId": "e989621f54392584b05867f87b160672",
        "failCode": null,
        "failMsg": null,
    },
    "msg": "Playground task completed successfully."
}
Failure Callback Example
{
    "code": 501,
    "data": {
        "completeTime": 1755597081000,
        "costTime": 0,
        "createTime": 1755596341000,
        "failCode": "500",
        "failMsg": "Internal server error",
        "model": "sora-2-image-to-video",
        "param": "{\"callBackUrl\":\"https://your-domain.com/api/callback\",\"model\":\"sora-2-image-to-video\",\"input\":{\"prompt\":\"A claymation conductor passionately leads a claymation orchestra, while the entire group joyfully sings in chorus the phrase: “Sora 2 is now available on Kie AI.\",\"image_urls\":[\"https://file.aiquickdraw.com/custom-page/akr/section-images/17594315607644506ltpf.jpg\"],\"aspect_ratio\":\"landscape\",\"n_frames\":\"10\",\"remove_watermark\":true,\"character_id_list\":[\"character_1\",\"character_2\"]}}",
        "state": "fail",
        "taskId": "bd3a37c523149e4adf45a3ddb5faf1a8",
        "resultJson": null,
    },
    "msg": "Playground task failed."
}
Important Notes
The callback content structure is identical to the Query Task API response
The param field contains the complete Create Task request parameters, not just the input section
If callBackUrl is not provided, no callback notifications will be sent



GET
/api/v1/jobs/recordInfo
Query Task
Query task status and results by task ID

Request Example

cURL

JavaScript

Python
curl -X GET "https://api.kie.ai/api/v1/jobs/recordInfo?taskId=task_12345678" \
  -H "Authorization: Bearer YOUR_API_KEY"
Response Example
{
  "code": 200,
  "message": "success",
  "data": {
    "taskId": "task_12345678",
    "model": "sora-2-image-to-video",
    "state": "success",
    "param": "{\"model\":\"sora-2-image-to-video\",\"callBackUrl\":\"https://your-domain.com/api/callback\",\"input\":{\"prompt\":\"A claymation conductor passionately leads a claymation orchestra, while the entire group joyfully sings in chorus the phrase: “Sora 2 is now available on Kie AI.\",\"image_urls\":[\"https://file.aiquickdraw.com/custom-page/akr/section-images/17594315607644506ltpf.jpg\"],\"aspect_ratio\":\"landscape\",\"n_frames\":\"10\",\"remove_watermark\":true,\"character_id_list\":[\"character_1\",\"character_2\"]}}",
    "resultJson": "{\"resultUrls\":[\"https://example.com/generated-image.jpg\"],\"resultWaterMarkUrls\":[\"https://example.com/generated-watermark-image.jpg\"]}",
    "failCode": "",
    "failMsg": "",
    "costTime": 0,
    "completeTime": 1698765432000,
    "createTime": 1698765400000
  }
}
Response Fields
code
Status code, 200 for success, others for failure
message
Response message, error description when failed
data.taskId
Task ID
data.model
Model used for generation
data.state
Generation state
data.param
Complete Create Task request parameters as JSON string (includes model, callBackUrl, input and all other parameters)
data.resultJson
Result JSON string containing generated media URLs
data.failCode
Error code (when generation failed)
data.failMsg
Error message (when generation failed)
data.completeTime
Completion timestamp
data.createTime
Creation timestamp
data.costTime
Cost time in milliseconds
State Values
waiting
Waiting for generation
queuing
In queue
generating
Generating
success
Generation successful
fail
Generation failed

