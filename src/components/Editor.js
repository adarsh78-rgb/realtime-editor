import React, { useEffect, useRef } from 'react'
import Codemirror from 'codemirror'
import 'codemirror/lib/codemirror.css';

import 'codemirror/mode/javascript/javascript';
import 'codemirror/theme/dracula.css';
import 'codemirror/addon/edit/closetag'
import 'codemirror/addon/edit/closebrackets'
import ACTIONS from '../Actions';



let codeMirrorInstance = null; // Prevent multiple instances


const Editor = ({ socketRef, roomId, onCodeChange }) => {

  const editorRef = useRef(null);



  useEffect(() => {
    async function init() {
      const editorElement = document.getElementById('realtimeEditor');
      if (!editorElement || codeMirrorInstance) return;

      editorRef.current = Codemirror.fromTextArea(editorElement, {
        mode: { name: 'javascript', json: true },
        theme: 'dracula',
        autoCloseTags: true,
        autoCloseBrackets: true,
        lineNumbers: true,
      });

      editorRef.current.on('change', (instance, changes) => {
        const { origin } = changes;
        const code = instance.getValue();

        onCodeChange(code);

        if (origin !== 'setValue') {
          socketRef.current.emit(ACTIONS.CODE_CHANGE, {

            roomId,
            code,

          });
        }
        //console.log(code)

      });



      // editorRef.current.setValue(`console`)

      //codeMirrorInstance.setSize('100%', '100%');
    }

    init();
  }, []);

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
        if (code !== null && code !== editorRef.current.getValue()) {
          editorRef.current.setValue(code);
        }

      });
    }
    return () => {
      socketRef.current.off(ACTIONS.CODE_CHANGE);
    }

  }, [socketRef.current]);

  return (
    <textarea
      id="realtimeEditor"
      style={{ display: 'none' }} // Hide the raw textarea
    ></textarea>
  );
};

export default Editor;