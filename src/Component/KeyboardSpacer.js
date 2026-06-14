import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Keyboard,
  LayoutAnimation,
  View,
  Dimensions,
  Platform,
  StyleSheet
} from 'react-native';

const styles = StyleSheet.create({
  container: {
    left: 0,
    right: 0,
    bottom: 0,
  },
});

const defaultAnimation = {
  duration: 500,
  create: {
    duration: 300,
    type: LayoutAnimation.Types.easeInEaseOut,
    property: LayoutAnimation.Properties.opacity
  },
  update: {
    type: LayoutAnimation.Types.spring,
    springDamping: 200
  }
};

export default class KeyboardSpacer extends Component {
  static propTypes = {
    topSpacing: PropTypes.number,
    onToggle: PropTypes.func,
    style: PropTypes.oneOfType([PropTypes.object, PropTypes.array, PropTypes.number]),
  };

  static defaultProps = {
    topSpacing: 0,
    onToggle: () => null,
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      keyboardSpace: 0,
      isKeyboardOpened: false
    };
    this._listeners = null;
    this.updateKeyboardSpace = this.updateKeyboardSpace.bind(this);
    this.resetKeyboardSpace = this.resetKeyboardSpace.bind(this);
  }

  componentDidMount() {
    const updateListener = Platform.OS === 'android' ? 'keyboardDidShow' : 'keyboardWillShow';
    const resetListener = Platform.OS === 'android' ? 'keyboardDidHide' : 'keyboardWillHide';
    this._listeners = [
      Keyboard.addListener(updateListener, this.updateKeyboardSpace),
      Keyboard.addListener(resetListener, this.resetKeyboardSpace)
    ];
  }

  componentWillUnmount() {
    if (this._listeners) {
      this._listeners.forEach(listener => listener.remove());
    }
  }

  updateKeyboardSpace(event) {
    if (!event.endCoordinates) {
      return;
    }

    let animationConfig = defaultAnimation;
    if (Platform.OS === 'ios') {
      animationConfig = LayoutAnimation.create(
        event.duration,
        LayoutAnimation.Types[event.easing],
        LayoutAnimation.Properties.opacity,
      );
    }
    LayoutAnimation.configureNext(animationConfig);

    const screenHeight = Dimensions.get('window').height;
    const keyboardSpace = (screenHeight - event.endCoordinates.screenY) + this.props.topSpacing;
    this.setState({
      keyboardSpace,
      isKeyboardOpened: true
    }, () => this.props.onToggle(true, keyboardSpace));
  }

  resetKeyboardSpace(event) {
    let animationConfig = defaultAnimation;
    if (Platform.OS === 'ios') {
      animationConfig = LayoutAnimation.create(
        event.duration ?? 250,
        LayoutAnimation.Types[event.easing ?? 'keyboard'],
        LayoutAnimation.Properties.opacity,
      );
    }
    LayoutAnimation.configureNext(animationConfig);

    this.setState({
      keyboardSpace: 0,
      isKeyboardOpened: false
    }, () => this.props.onToggle(false, 0));
  }

  render() {
    return (
      <View style={[styles.container, { height: this.state.keyboardSpace }, this.props.style]} />);
  }
}
