// src/components/TextEditor.js
import { useEffect, useState } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import "./TextEditor.css";
import { PropTypes } from "prop-types";
import axios from 'axios'

const TextEditor = ({ onContentChange, reset }) => {
  const [editorData, setEditorData] = useState("");

  const customUploadAdapter = (loader) => {
    return {
        upload: () => {
            return new Promise((resolve, reject) => {
                const data = new FormData();
                loader.file.then((file) => {
                    data.append('image', file); // Match the field name used in your backend
                    axios.post('http://localhost:3001/upload', data, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    })
                        .then((response) => {
                            resolve({
                                default: response.data.imageUrl,
                            });
                        })
                        .catch((error) => {
                            reject(error);
                        });
                });
            });
        },
    };
};

function uploadPlugin(editor) {
    editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
        return customUploadAdapter(loader);
    };
}
useEffect(() => {
    onContentChange(editorData);
  }, [editorData, onContentChange]);

  useEffect(() => {
    if (reset) {
      setEditorData(""); // Clear the editor data
    }
  }, [reset]);

  return (
    <div className="text-editor">
      <CKEditor
        editor={ClassicEditor}
        data={editorData}
        config={{
          extraPlugins: [uploadPlugin],
        }}
        onChange={(event, editor) => {
          const data = editor.getData();
          setEditorData(data);
          console.log(data);
        }}
      />
    </div>
  );
};
TextEditor.propTypes = {
  onContentChange: PropTypes.func.isRequired,
  reset:PropTypes.func.isRequired
};

export default TextEditor;
