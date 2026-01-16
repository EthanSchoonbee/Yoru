import { Image, StyleSheet, View } from 'react-native';

export function PaperTexture() {
  return (
    <View pointerEvents="none" style={styles.wrap}>
      <Image
        source={require('../../assets/textures/paper-noise.png')}
        style={styles.img}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
    opacity: 0.18,
  },
  img: {
    width: '100%',
    height: '100%',
  },
});
