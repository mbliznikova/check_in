import { SafeAreaView } from "react-native";
import { Header } from "./Header";
import ScreenTitle from "./ScreenTitle";

const SchoolManagement = () => {
    return (
        <SafeAreaView style={{ flex: 1 }}>
            <Header/>
            <ScreenTitle titleText='School Management'></ScreenTitle>
        </SafeAreaView>
    );
};

export default SchoolManagement;