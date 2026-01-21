import React from "react";

interface UploadedFile {
  id: number;
  file: File;
  preview: string;
}

interface FileUploadProps {
  uploadedFiles: UploadedFile[];
  maxFiles: number;
  fileError: string;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (id: number) => void;
  onImageClick: (preview: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({
  uploadedFiles,
  maxFiles,
  fileError,
  onFileUpload,
  onRemoveFile,
  onImageClick,
}) => {
  return (
    <div className="bg-white border rounded-xl p-6 mt-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
          <svg
            className="w-5 h-5 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-gray-800">Хавсралт зураг</h2>
      </div>

      <div className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={onFileUpload}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer flex flex-col items-center justify-center py-6"
          >
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <p className="mt-2 text-sm text-gray-600">Зураг оруулах</p>
            <p className="text-xs text-gray-500">
              ({uploadedFiles?.length}/{maxFiles} зураг)
            </p>
          </label>
        </div>

        {fileError && <p className="text-red-500 text-sm">{fileError}</p>}

        <div className="grid grid-cols-4 gap-4">
          {uploadedFiles?.map((file) => (
            <div key={file.id} className="relative group">
              <img
                src={file.preview}
                alt="preview"
                className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => onImageClick(file.preview)}
              />
              <button
                onClick={() => onRemoveFile(file.id)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
