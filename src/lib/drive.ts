
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
      console.error('Failed to fetch notes from Drive:', await response.text());
      return [];
    }
    
    const notes = await response.json();
    return Array.isArray(notes) ? notes : [];
  } catch (e) {
    console.error('Failed to parse notes from Drive', e);
    return [];
  }
};

// Saves notes to Google Drive
export const saveNotesToDrive = async (accessToken: string, notes: Note[]): Promise<void> => {
  try {
    const fileId = await findNotesFile(accessToken);
    const fileContent = JSON.stringify(notes, null, 2);
    
    if (fileId) {
      // Update existing file
      const response = await fetch(`${DRIVE_UPLOAD_API_URL}/${fileId}?uploadType=media`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: fileContent,
      });
      if (!response.ok) {
        console.error('Failed to update notes in Drive:', await response.text());
      }
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

      const response = await fetch(`${DRIVE_UPLOAD_API_URL}?uploadType=multipart`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: form,
      });
      if (!response.ok) {
        console.error('Failed to create notes file in Drive:', await response.text());
      }
    }
  } catch (error) {
    console.error('Error saving notes to Drive:', error);
  }
};
