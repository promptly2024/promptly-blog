'use client';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
    Upload,
    Download,
    Trash2,
    Eye,
    Copy,
    MoreHorizontal,
    X,
    CheckCircle,
    Info,
    FileText,
    User,
    Image,
    AlertTriangle
} from 'lucide-react';

interface MediaItem {
    id: string;
    url: string;
    publicId: string;
    alt?: string;
    createdAt: string;
}

export const MediaCard = ({
    item,
    viewMode,
    isSelected,
    isDeleting,
    onSelect,
    onDelete,
    onDownload,
    onCopyUrl
}: {
    item: MediaItem;
    viewMode: 'grid' | 'list';
    isSelected: boolean;
    isDeleting: boolean;
    onSelect: (id: string, selected: boolean) => void;
    onDelete: (id: string, publicId: string) => void;
    onDownload: (url: string, filename: string) => void;
    onCopyUrl: (url: string) => void;
}) => {
    if (viewMode === 'list') {
        return (
            <div className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg hover:bg-slate-50 transition-colors ${isSelected ? 'ring-2 ring-sky-500 border-sky-300' : 'border-slate-200'
                }`}>
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => onSelect(item.id, e.target.checked)}
                    className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 flex-shrink-0"
                />
                <img
                    src={item.url}
                    alt={item.alt || ''}
                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-slate-200 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-slate-900 truncate text-sm sm:text-base"
                        title={item.alt || 'No Title Provided'}>
                        {item.alt || 'No Title Provided'}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500"
                        title={`You uploaded this image on ${new Date(item.createdAt).toLocaleString()}`}>
                        {new Date(item.createdAt).toLocaleString()}
                    </p>
                </div>
                <div className="flex-shrink-0">
                    <ActionDropdown
                        item={item}
                        isDeleting={isDeleting}
                        onDelete={onDelete}
                        onDownload={onDownload}
                        onCopyUrl={onCopyUrl}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className={`group relative border rounded-xl hover:shadow-lg transition-all duration-200 ${isSelected ? 'ring-2 ring-sky-500 border-sky-300' : 'border-slate-200'
            } overflow-visible`}>
            <div className="relative overflow-visible">
                <img
                    src={item.url}
                    alt={item.alt || ''}
                    className="w-full h-56 sm:h-64 lg:h-72 object-cover"
                />
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => onSelect(item.id, e.target.checked)}
                    className="absolute top-2 left-2 sm:top-3 sm:left-3 rounded border-white shadow-sm text-sky-600 focus:ring-sky-500"
                />
                <div className="absolute top-2 right-2 sm:top-3 sm:right-3 opacity-0 group-hover:opacity-100 transition-opacity z-40">
                    <ActionDropdown
                        item={item}
                        isDeleting={isDeleting}
                        onDelete={onDelete}
                        onDownload={onDownload}
                        onCopyUrl={onCopyUrl}
                    />
                </div>
            </div>
            <div className="p-3 sm:p-4">
                <h3 className="font-medium text-slate-900 truncate mb-1 text-sm sm:text-base"
                    title={item.alt || 'No Title Provided'}>
                    {item.alt || 'No Title Provided'}
                </h3>
                <p className="text-xs text-slate-500"
                    title={`You uploaded this image on ${new Date(item.createdAt).toLocaleString()}`}>
                    {new Date(item.createdAt).toLocaleString()}
                </p>
            </div>
        </div>
    );
};

// Action Dropdown Component
const ActionDropdown = ({
    item,
    isDeleting,
    onDelete,
    onDownload,
    onCopyUrl
}: {
    item: MediaItem;
    isDeleting: boolean;
    onDelete: (id: string, publicId: string) => void;
    onDownload: (url: string, filename: string) => void;
    onCopyUrl: (url: string) => void;
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState<'left' | 'right'>('right');
    const buttonRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && buttonRef.current) {
            const buttonRect = buttonRef.current.getBoundingClientRect();
            const dropdownWidth = 192; // w-48 = 12rem = 192px
            const spaceRight = window.innerWidth - buttonRect.right;

            setPosition(spaceRight < dropdownWidth ? 'left' : 'right');
        }
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        const handleScroll = () => setIsOpen(false);

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('scroll', handleScroll, true);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('scroll', handleScroll, true);
        };
    }, [isOpen]);

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                className="p-1.5 sm:p-2 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-colors"
            >
                <MoreHorizontal className="w-3 h-3 sm:w-4 sm:h-4 text-slate-600" />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-20" onClick={() => setIsOpen(false)} />
                    <div
                        ref={dropdownRef}
                        className={`absolute mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-50 ${position === 'left' ? 'right-0' : 'left-0'
                            }`}
                        style={{ zIndex: 9999 }}
                    >
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                window.open(item.url, '_blank');
                                setIsOpen(false);
                            }}
                            className="flex items-center gap-3 px-3 py-2 text-slate-700 hover:bg-slate-50 transition-colors w-full text-left text-sm"
                        >
                            <Eye className="w-4 h-4" />
                            View Full Size
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onCopyUrl(item.url);
                                setIsOpen(false);
                            }}
                            className="flex items-center gap-3 px-3 py-2 text-slate-700 hover:bg-slate-50 transition-colors w-full text-left text-sm"
                        >
                            <Copy className="w-4 h-4" />
                            Copy URL
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDownload(item.url, item.alt || 'image');
                                setIsOpen(false);
                            }}
                            className="flex items-center gap-3 px-3 py-2 text-slate-700 hover:bg-slate-50 transition-colors w-full text-left text-sm"
                        >
                            <Download className="w-4 h-4" />
                            Download
                        </button>
                        <hr className="my-1 border-slate-200" />
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(item.id, item.publicId);
                                setIsOpen(false);
                            }}
                            disabled={isDeleting}
                            className="flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 transition-colors w-full text-left text-sm disabled:opacity-50"
                        >
                            <Trash2 className="w-4 h-4" />
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export const UploadModal = ({
    selectedFile,
    isUploading,
    onFileSelect,
    onUpload,
    onClose
}: {
    selectedFile: File | null;
    isUploading: boolean;
    onFileSelect: (file: File | null) => void;
    onUpload: () => void;
    onClose: () => void;
}) => {
    const [dragOver, setDragOver] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);

        const files = Array.from(e.dataTransfer.files);
        const imageFile = files.find(file => file.type.startsWith('image/'));

        if (imageFile) {
            onFileSelect(imageFile);
        } else {
            toast.error('Please drop an image file');
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            onFileSelect(file);
        } else {
            toast.error('Please select an image file');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div
                className="bg-white rounded-xl w-full max-w-2xl p-6"
                style={{ maxHeight: '520px', minHeight: '400px', overflowY: 'auto' }}
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-slate-900">Upload Image</h2>
                    <button
                        onClick={onClose}
                        disabled={isUploading}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <X className="w-5 h-5 text-slate-600" />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Drop Zone */}
                    <div
                        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${dragOver
                            ? 'border-sky-400 bg-sky-50'
                            : selectedFile
                                ? 'border-green-400 bg-green-50'
                                : 'border-slate-300 hover:border-slate-400'
                            }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        style={{ minHeight: '120px' }}
                    >
                        {selectedFile ? (
                            <div className="space-y-4">
                                <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
                                <div>
                                    <h3 className="font-medium text-slate-900">{selectedFile.name}</h3>
                                    <p className="text-sm text-slate-500">
                                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                </div>
                                <button
                                    onClick={() => onFileSelect(null)}
                                    className="text-sm text-slate-600 hover:text-slate-800 underline"
                                >
                                    Choose different file
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <Upload className="w-12 h-12 text-slate-400 mx-auto" />
                                <div>
                                    <h3 className="font-medium text-slate-900 mb-2">
                                        Drop your image here, or click to browse
                                    </h3>
                                    <p className="text-sm text-slate-500">
                                        Supports JPG, PNG, GIF, WebP up to 10MB
                                    </p>
                                </div>
                                <label className="inline-block">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileInput}
                                        className="hidden"
                                    />
                                    <span className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg cursor-pointer transition-colors inline-block">
                                        Browse Files
                                    </span>
                                </label>
                            </div>
                        )}
                    </div>

                    {/* Preview */}
                    {selectedFile && (
                        <div className="space-y-3">
                            <h4 className="font-medium text-slate-900">Preview:</h4>
                            <div className="border border-slate-200 rounded-lg overflow-hidden">
                                <img
                                    src={URL.createObjectURL(selectedFile)}
                                    alt="Preview"
                                    className="w-full"
                                    // style={{ height: '180px', objectFit: 'cover' }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            disabled={isUploading}
                            className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onUpload}
                            disabled={!selectedFile || isUploading}
                            className="flex-1 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            {isUploading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-4 h-4" />
                                    Upload Image
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const MediaInfoCard = () => {
    return (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mt-6">
            <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Info className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                    <h3 className="font-semibold text-blue-900 mb-1">Media Library Information</h3>
                    <p className="text-blue-700 text-sm">Important details about managing your images</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Usage Information */}
                <div className="space-y-3">
                    <h4 className="font-medium text-blue-900 flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        What you can do:
                    </h4>
                    <ul className="space-y-2 text-sm text-blue-800">
                        <li className="flex items-start gap-2">
                            <Upload className="w-3 h-3 mt-1 text-blue-600 flex-shrink-0" />
                            <span>Upload and manage all your images in one place</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <FileText className="w-3 h-3 mt-1 text-blue-600 flex-shrink-0" />
                            <span>Select images as thumbnails while writing blogs or articles</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <User className="w-3 h-3 mt-1 text-blue-600 flex-shrink-0" />
                            <span>Use images for profile pictures and other content</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <Image className="w-3 h-3 mt-1 text-blue-600 flex-shrink-0" />
                            <span>Organize and search through your image collection</span>
                        </li>
                    </ul>
                </div>

                {/* Warning Information */}
                <div className="space-y-3">
                    <h4 className="font-medium text-orange-900 flex items-center gap-2 text-sm">
                        <AlertTriangle className="w-4 h-4 text-orange-600" />
                        Important warnings:
                    </h4>
                    <ul className="space-y-2 text-sm text-orange-800">
                        <li className="flex items-start gap-2">
                            <Trash2 className="w-3 h-3 mt-1 text-red-600 flex-shrink-0" />
                            <span>Deleting an image will remove it from all blogs using it as thumbnail</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <AlertTriangle className="w-3 h-3 mt-1 text-orange-600 flex-shrink-0" />
                            <span>Blog thumbnails will be set to null if their image is deleted</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <AlertTriangle className="w-3 h-3 mt-1 text-orange-600 flex-shrink-0" />
                            <span>Always backup important images before deleting</span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Quick Tips */}
            <div className="mt-6 pt-4 border-t border-blue-200">
                <h4 className="font-medium text-blue-900 mb-3 text-sm">Quick Tips:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="bg-white bg-opacity-50 rounded-lg p-3 text-xs text-blue-700">
                        <strong>Organize:</strong> Use descriptive alt text for better searchability
                    </div>
                    <div className="bg-white bg-opacity-50 rounded-lg p-3 text-xs text-blue-700">
                        <strong>Quality:</strong> Upload high-resolution images for best results
                    </div>
                    <div className="bg-white bg-opacity-50 rounded-lg p-3 text-xs text-blue-700">
                        <strong>Storage:</strong> Regularly clean up unused images to save space
                    </div>
                </div>
            </div>
        </div>
    );
};