import React from "react";
import { Text } from "react-native";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";

const GradientText = ({ children, style, colors = ["#5865F2", "#00A3FF"] }) => {
  return (
    <MaskedView maskElement={<Text style={style}>{children}</Text>}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text
          style={[
            style,
            {
              opacity: 0,
            },
          ]}
        >
          {children}
        </Text>
      </LinearGradient>
    </MaskedView>
  );
};

export default GradientText;
