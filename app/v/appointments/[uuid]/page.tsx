import React from "react";

const ViewAppointment = async ({ params }: { params: Promise<{ uuid: string }> }) => {
    const { uuid } = await params;
    return <div>{uuid}</div>;
};

export default ViewAppointment;
