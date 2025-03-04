"use client";

import { Button, CheckboxGroup, Code, Fieldset } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Checkbox } from "@/components/ui/checkbox";
import { useController, useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  framework: z.array(z.string()).min(1, {
    message: "You must select at least one framework.",
  }),
});

type FormData = z.infer<typeof formSchema>;

type FormValues = {
  framework: string[];
};

const items = [
  { label: "React", value: "react" },
  { label: "Svelte", value: "svelte" },
  { label: "Vue", value: "vue" },
  { label: "Angular", value: "angular" },
];

const Test = () => {
  const {
    register,
    handleSubmit,
    // control,
    // formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      something: [],
      framework: [],
    },
  });

  // const framework = useController({
  //   control,
  //   name: "framework",
  //   defaultValue: [],
  // });

  // const invalid = !!errors.framework;

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <Fieldset.Root>
        <Fieldset.Legend>Select your framework!!!! yooo</Fieldset.Legend>
        {/* <CheckboxGroup
        // value={framework.field.value}
        // onValueChange={framework.field.onChange}
        // name={framework.field.name}
        > */}
        <Fieldset.Content>
          {items.map((item) => (
            <Checkbox
              key={item.value}
              value={item.value}
              {...register("framework")}
            >
              {item.label}
            </Checkbox>
          ))}
        </Fieldset.Content>
        {/* </CheckboxGroup> */}
        {/* 
        {errors.framework && (
          <Fieldset.ErrorText>{errors.framework.message}</Fieldset.ErrorText>
        )} */}

        <Button size="sm" type="submit" alignSelf="flex-start">
          Submit
        </Button>

        {/* <Code>Values: {JSON.stringify(framework.field.value, null, 2)}</Code> */}
      </Fieldset.Root>
    </form>
  );
};

export default Test;
