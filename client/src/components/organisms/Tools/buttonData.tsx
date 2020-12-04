import React from 'react';

import {
  BsFillSkipStartFill,
  BsFillSkipEndFill,
  BsFillPlayFill,
  BsFillPauseFill,
  BsAspectRatio,
} from 'react-icons/bs';
import { RiScissorsLine } from 'react-icons/ri';
import { MdScreenRotation } from 'react-icons/md';

import size from '@/theme/sizes';

import color from '@/theme/colors';
import { ButtonData, ButtonTypes } from './reducer';

interface button {
  onClick: () => void;
  message: string;
  type: 'default' | 'transparent' | 'selected';
  children: React.ReactChild;
  disabled?: boolean;
}

export const getVideoToolsData = (
  backwardVideo: () => void,
  playPauseVideo: () => void,
  forwardVideo: () => void,
  play: boolean,
  hasEmptyVideo: boolean
): button[] => [
  {
    onClick: backwardVideo,
    message: '',
    type: 'transparent',
    children: <BsFillSkipStartFill size={size.BIG_ICON_SIZE} />,
    disabled: hasEmptyVideo,
  },
  {
    onClick: playPauseVideo,
    message: '',
    type: 'transparent',
    children: play ? (
      <BsFillPauseFill size={size.BIG_ICON_SIZE} />
    ) : (
      <BsFillPlayFill size={size.BIG_ICON_SIZE} />
    ),
    disabled: hasEmptyVideo,
  },
  {
    onClick: forwardVideo,
    message: '',
    type: 'transparent',
    children: <BsFillSkipEndFill size={size.BIG_ICON_SIZE} />,
    disabled: hasEmptyVideo,
  },
];

export const getEditToolData = (
  rotateReverse: () => void,
  ratio: () => void,
  crop: () => void,
  hasEmptyVideo: boolean,
  toolType: ButtonTypes
): button[] => [
  {
    onClick: rotateReverse,
    message: '회전 / 반전',
    type: toolType === ButtonTypes.videoEffect ? 'selected' : 'transparent',
    children: (
      <MdScreenRotation
        size={size.ICON_SIZE}
        color={
          toolType === ButtonTypes.videoEffect ? color.PALE_PURPLE : undefined
        }
      />
    ),
    disabled: hasEmptyVideo,
  },
  {
    onClick: ratio,
    message: '비율',
    type: toolType === ButtonTypes.ratio ? 'selected' : 'transparent',
    children: (
      <BsAspectRatio
        size={size.ICON_SIZE}
        color={toolType === ButtonTypes.ratio ? color.PALE_PURPLE : undefined}
      />
    ),
    disabled: hasEmptyVideo,
  },
  {
    onClick: crop,
    message: '자르기',
    type: toolType === ButtonTypes.crop ? 'selected' : 'transparent',
    children: (
      <RiScissorsLine
        size={size.ICON_SIZE}
        color={toolType === ButtonTypes.crop ? color.PALE_PURPLE : undefined}
      />
    ),
    disabled: hasEmptyVideo,
  },
];

export const getSubEditToolsData = (buttonData: ButtonData): button[] =>
  [...Array(buttonData.onClicks?.length)].map((_, idx) => ({
    onClick: buttonData.onClicks[idx],
    message: buttonData.messages[idx],
    type: buttonData.type,
    children: buttonData.childrens[idx],
  }));