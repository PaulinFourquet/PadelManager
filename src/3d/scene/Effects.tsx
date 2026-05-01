import { Bloom, BrightnessContrast, EffectComposer, SMAA, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';

export const Effects = () => (
  <EffectComposer multisampling={0}>
    <SMAA />
    <Bloom
      intensity={0.55}
      luminanceThreshold={0.78}
      luminanceSmoothing={0.18}
      mipmapBlur
    />
    <BrightnessContrast brightness={-0.02} contrast={0.06} />
    <Vignette
      offset={0.3}
      darkness={0.55}
      eskil={false}
      blendFunction={BlendFunction.NORMAL}
    />
  </EffectComposer>
);
