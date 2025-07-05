
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Copy, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

const AppsScriptSetup = () => {
  const appsScriptCode = `function doPost(e) {
  // Enable CORS
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  
  try {
    const data = JSON.parse(e.postData.contents);
    console.log('Received request:', data);
    
    if (data.action === 'analyzeImage') {
      const result = analyzeImage(data.imageData, data.prompt);
      const response = { result: result };
      output.setContent(JSON.stringify(response));
    } else if (data.action === 'generateSummary') {
      const result = generateSummary(data.notesText, data.prompt);
      const response = { result: result };
      output.setContent(JSON.stringify(response));
    } else {
      throw new Error('Unknown action: ' + data.action);
    }
    
  } catch (error) {
    console.error('Error:', error);
    const errorResponse = { error: error.toString() };
    output.setContent(JSON.stringify(errorResponse));
  }
  
  return output;
}

function analyzeImage(base64ImageData, prompt) {
  const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE'; // Replace with your actual API key
  
  const payload = {
    contents: [{
      parts: [
        { text: prompt },
        {
          inline_data: {
            mime_type: 'image/jpeg',
            data: base64ImageData
          }
        }
      ]
    }]
  };
  
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    payload: JSON.stringify(payload)
  };
  
  const url = \`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=\${GEMINI_API_KEY}\`;
  
  try {
    const response = UrlFetchApp.fetch(url, options);
    const responseData = JSON.parse(response.getContentText());
    
    if (responseData.candidates && responseData.candidates[0] && responseData.candidates[0].content) {
      return responseData.candidates[0].content.parts[0].text;
    } else {
      throw new Error('Invalid response from Gemini API');
    }
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to analyze image: ' + error.toString());
  }
}

function generateSummary(notesText, prompt) {
  const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE'; // Replace with your actual API key
  
  const payload = {
    contents: [{
      parts: [{ text: prompt }]
    }]
  };
  
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    payload: JSON.stringify(payload)
  };
  
  const url = \`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=\${GEMINI_API_KEY}\`;
  
  try {
    const response = UrlFetchApp.fetch(url, options);
    const responseData = JSON.parse(response.getContentText());
    
    if (responseData.candidates && responseData.candidates[0] && responseData.candidates[0].content) {
      return responseData.candidates[0].content.parts[0].text;
    } else {
      throw new Error('Invalid response from Gemini API');
    }
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to generate summary: ' + error.toString());
  }
}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const openAppsScript = () => {
    window.open('https://script.google.com', '_blank');
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Google Apps Script Setup Instructions
          <Button variant="outline" size="sm" onClick={openAppsScript}>
            Open Apps Script <ExternalLink className="h-4 w-4 ml-1" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">Step 1: Create a new Google Apps Script project</h3>
          <p className="text-sm text-muted-foreground">
            Go to <a href="https://script.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">script.google.com</a> and create a new project.
          </p>
        </div>
        
        <div>
          <h3 className="font-semibold mb-2">Step 2: Replace the default code</h3>
          <div className="relative">
            <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto max-h-64 overflow-y-auto">
              <code>{appsScriptCode}</code>
            </pre>
            <Button
              variant="outline"
              size="sm"
              className="absolute top-2 right-2"
              onClick={() => copyToClipboard(appsScriptCode)}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Step 3: Get your Gemini API Key</h3>
          <p className="text-sm text-muted-foreground">
            1. Go to <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google AI Studio</a><br/>
            2. Create a new API key<br/>
            3. Replace 'YOUR_GEMINI_API_KEY_HERE' in the code above with your actual API key
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Step 4: Deploy as Web App</h3>
          <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Click "Deploy" → "New deployment"</li>
            <li>Choose type: "Web app"</li>
            <li>Execute as: "Me"</li>
            <li>Who has access: "Anyone"</li>
            <li>Click "Deploy"</li>
            <li>Copy the web app URL</li>
            <li>Update the APPS_SCRIPT_URL in your code</li>
          </ol>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-800 mb-2">Important Notes:</h4>
          <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
            <li>Make sure to authorize the script when prompted</li>
            <li>The "Anyone" access is required for the frontend to call the script</li>
            <li>Keep your Gemini API key secure - don't share the Apps Script publicly</li>
            <li>Test the deployment URL directly in your browser first</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default AppsScriptSetup;
