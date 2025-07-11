'use client';

import { useEffect, useState } from "react";
import PreviewDialogBtn from "./PreviewDialogBtn";
import Designer from "./Designer";
import {
    DndContext,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import DragOverlayWrapper from "./DragOverlayWrapper";
import useDesigner from "./hooks/useDesigner";
import PublishFormBtn from "./PublishFormBtn";
import SaveFormBtn from "./SaveFormBtn";
import { ImSpinner2 } from "react-icons/im";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { toast } from "./ui/use-toast";
import Link from "next/link";
import { BsArrowLeft, BsArrowRight } from "react-icons/bs";
import { type Schema } from '../amplify/data/resource';
import PreviewPDFDialogBtn from "./PreviewPDFDialogBtn";

type Form = Schema['Form']['type'];

function FormBuilder({ formID, form, equipmentName, clientName, formName, revision }: { formID: string, form: Form, equipmentName: string, clientName: string, formName: string, revision: number }) {
    const { setElements, setSelectedElement } = useDesigner();
    const [isReady, setIsReady] = useState(false);
    const mouseSensor = useSensor(MouseSensor, {
        activationConstraint: { distance: 10 },
    });
    const touchSensor = useSensor(TouchSensor, {
        activationConstraint: { delay: 300, tolerance: 5 },
    });
    const sensors = useSensors(mouseSensor, touchSensor);

    useEffect(() => {
        if (!isReady) {
            const elements = JSON.parse(form.content ?? "[]");
            setElements(elements);
            setSelectedElement(null);
            const readyTimeout = setTimeout(() => setIsReady(true), 500);
            return () => clearTimeout(readyTimeout);
        }
    }, [form, setElements, isReady, setSelectedElement]);

    if (!isReady) {
        return (
            <div className="flex flex-col items-center justify-center w-full h-full">
                <ImSpinner2 className="animate-spin h-12 w-12" />
            </div>
        );
    }

    //const shareUrl = `${window.location.origin}/submit/${formID}`;
    const useURL = `${window.location.origin}/forms/${formID}`

    if (form.published) {
        return (
            <div className="flex flex-col items-center justify-center h-full w-full">
                <div className="max-w-md">
                    <div className="space-y-4 text-center">
                        <h2 className="text-3xl font-bold text-green-600 flex justify-center items-center gap-2">
                            Form Published!
                        </h2>
                        <h2 className="text-2xl font-semibold">Share this form</h2>
                        <h3 className="text-lg text-muted-foreground border-b pb-6">
                            Anyone with the link can view and submit the form
                        </h3>
                    </div>

                    <div className="my-4 flex flex-col gap-2 items-center w-full border-b pb-4">

                        <Input className="w-full" readOnly value={useURL} />

                        <Button
                            className="mt-2 w-full"
                            onClick={() => {
                                navigator.clipboard.writeText(useURL);
                                toast({
                                    title: "Copied!",
                                    description: "Link copied to clipboard",
                                });
                            }}
                        >
                            Copy link
                        </Button>
                    </div>
                    <div className="flex justify-between">
                        <Button variant={"link"} asChild>
                            <Link href={"/"} className="gap-2">
                                <BsArrowLeft />
                                Go back home
                            </Link>
                        </Button>
                        <Button variant={"link"} asChild>
                            <Link href={`/forms/${formID}`} className="gap-2">
                                Form details
                                <BsArrowRight />
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <DndContext sensors={sensors}>
            <main className="flex flex-col w-full">
                <nav className="flex justify-between border-b-2 p-4 gap-3 items-center">
                    <h2 className="truncate font-medium">
                        <span className="text-muted-foreground mr-2">Form:</span>
                        {formName}
                    </h2>
                    <h2 className="truncate font-medium">
                        <span className="text-muted-foreground mr-2">Client:</span>
                        {clientName}
                    </h2>
                    <h2 className="truncate font-medium">
                        <span className="text-muted-foreground mr-2">Equipment Name:</span>
                        {equipmentName}
                    </h2>
                    <div className="flex items-center gap-2">
                        <PreviewDialogBtn />
                        <PreviewPDFDialogBtn formName={formName} revision={revision} />
                        {!form.published && <SaveFormBtn id={formID} />}
                        <PublishFormBtn id={formID} />
                    </div>
                </nav>
                <div className="flex w-full flex-grow items-center justify-center relative overflow-y-auto h-[200px] bg-accent bg-[url(/paper.svg)] dark:bg-[url(/paper-dark.svg)]">
                    <Designer />
                </div>
            </main>
            <DragOverlayWrapper />
        </DndContext>
    );
}

export default FormBuilder;
