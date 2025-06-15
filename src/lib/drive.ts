import { Note } from "@/types";

const NOTES_FILE_NAME = 'visual_notes.json';
const DRIVE_API_URL = 'https://www.googleapis.com/drive/v3/files';
const DRIVE_UPLOAD_API_URL = 'https://www.googleapis.com/upload/drive/v3/files';

// Finds the notes file in the appDataFolder
const findNotesFile = async (accessToken: string): Promise<string | null> => {
  try {
    const response = await fetch(`${DRIVE_API_URL}?q=name='${NOTES_FILE_NAME}'&spaces=appDataFolder&fields=files(id)`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) {
      console.error('Failed to search for notes file:', await response.text());
      return null;
    }
    const data = await response.json();
    return data.files.length > 0 ? data.files[0].id : null;
  } catch (error) {
    console.error('Error finding notes file:', error);
    return null;
  }
};

// Gets notes from Google Drive
export const getNotesFromDrive = async (accessToken: string): Promise<Note[]> => {
  const fileId = await findNotesFile(accessToken);
  if (!fileId) {
    return [];
  }

  try {
    const response = await fetch(`${DRIVE_API_URL}/${fileId}?alt=media`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (response.status === 404) {
      return [];
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch notes from Drive:', errorText);
      throw new Error('Failed to fetch notes from Google Drive.');
    }
    
    const notes = await response.json();
    return Array.isArray(notes) ? notes : [];
  } catch (e: any) {
    console.error('Error fetching or parsing notes from Drive', e);
    if (e.message.includes('Failed to fetch')) throw e;
    throw new Error('Could not read notes from Google Drive.');
  }
};

// Saves notes to Google Drive
export const saveNotesToDrive = async (accessToken: string, notes: Note[]): Promise<void> => {
  const fileId = await findNotesFile(accessToken);
  const fileContent = JSON.stringify(notes, null, 2);
  
  let response;
  if (fileId) {
    // Update existing file
    response = await fetch(`${DRIVE_UPLOAD_API_URL}/${fileId}?uploadType=media`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: fileContent,
    });
  } else {
    // Create new file
    const metadata = {
      name: NOTES_FILE_NAME,
      parents: ['appDataFolder'],
      mimeType: 'application/json',
    };
    
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', new Blob([fileContent], { type: 'application/json' }));

    response = await fetch(`${DRIVE_UPLOAD_API_URL}?uploadType=multipart`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: form,
    });
  }

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Failed to save notes to Drive:', errorText);
    throw new Error('Failed to save notes to Google Drive.');
  }
};
