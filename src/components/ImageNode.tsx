import { memo } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';

export type ImageNodeData = {
  label?: string;
  imageUrl?: string;
  isLoading?: boolean;
};

export type ImageNodeType = Node<ImageNodeData, 'imageNode'>;

function ImageNode({ data, selected }: NodeProps<Node<ImageNodeData>>) {
  return (
    <div
      className={`rounded-lg border-2 bg-white shadow-lg transition-all ${
        selected ? 'border-blue-500 shadow-xl' : 'border-gray-300'
      }`}
      style={{ minWidth: 200 }}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      
      <div className="p-2">
        {data.label && (
          <div className="text-sm font-semibold mb-2 text-gray-700">
            {data.label}
          </div>
        )}
        
        {data.isLoading ? (
          <div className="w-48 h-48 flex items-center justify-center bg-gray-100 rounded">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
              <p className="text-xs text-gray-500">Waiting for prompt...</p>
            </div>
          </div>
        ) : data.imageUrl ? (
          <img
            src={data.imageUrl}
            alt={data.label || 'Node image'}
            className="w-full h-auto rounded object-cover"
            style={{ maxHeight: 200 }}
          />
        ) : (
          <div className="w-48 h-48 flex items-center justify-center bg-gray-50 rounded border-2 border-dashed border-gray-300">
            <p className="text-sm text-gray-400">No image</p>
          </div>
        )}
      </div>
      
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
}

export default memo(ImageNode);
