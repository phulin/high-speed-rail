import {
  Button,
  Heading,
  IconButton,
  NativeSelectField,
  NativeSelectRoot,
  Stack,
  Table,
  Text,
} from "@chakra-ui/react";
import { Effect, haveEffect } from "kolmafia";
import { $effects } from "libram";
import { ArrowDown, ArrowUp, CircleArrowRight } from "lucide-react";
import {
  FC,
  MouseEvent,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { RefreshContext } from "tome-kolmafia-react";

const COAL_HOPPER = 8;

function effectTurns(effects: Effect[]) {
  return effects.map((e): [Effect, number] => [e, haveEffect(e)]);
}

const Layout: FC = () => {
  useContext(RefreshContext);
  const {
    pwd,
    position,
    stations,
    selectedStations: initialSelectedStations,
  } = useMemo(() => {
    const form = document.getElementById("amodeform") as HTMLFormElement | null;
    if (!form) return {};
    const pwdInput = form.elements.namedItem("pwd") as HTMLInputElement;
    const selects = [...new Array(8).keys()].map(
      (i) => form.elements.namedItem(`slot[${i}]`) as HTMLSelectElement,
    );
    const options = [
      ...(selects[0]?.getElementsByTagName("option") ?? []),
    ] as HTMLOptionElement[];
    const stations: [number, string][] = options.map((option) => [
      parseInt(option.value),
      option.innerText,
    ]);
    const selectedStations = selects.map((select) => parseInt(select.value));

    const positionString = form.innerHTML.match(
      /Your train is about to pass station ([0-9])\./,
    )?.[1];
    return {
      pwd: pwdInput.value,
      position: positionString ? parseInt(positionString) : undefined,
      stations,
      selectedStations,
    };
  }, []);

  const [serverSelectedStations, setServerSelectedStations] = useState<
    number[]
  >(initialSelectedStations ?? []);
  const [selectedStations, setSelectedStations] = useState<number[]>(
    initialSelectedStations ?? [],
  );
  const [isLoading, setIsLoading] = useState(false);

  const singleEffects = $effects`Carbonated, Frozen, Shivering Spine, Hot Soupy Garbage, Spookily Greasy, Burningly Oiled, Troubled Waters, Craving Prawns`;
  const doubleEffects = $effects`Double Carbonated, Double Frozen, Doubly Shivering Spine, Double Hot Soupy Garbage, Doubly Spookily Greasy, Doubly Burningly Oiled, Doubly Troubled Waters, Doubly Craving Prawns`;
  const allEffectTurns = [
    effectTurns(singleEffects),
    effectTurns(doubleEffects),
  ];

  const rotate = useCallback((direction: 1 | -1) => {
    setSelectedStations((selectedStations) => {
      const index =
        direction > 0 ? direction : selectedStations.length + direction;
      return [
        ...selectedStations.slice(index),
        ...selectedStations.slice(0, index),
      ];
    });
  }, []);
  const rotateLeft = useCallback(() => rotate(1), [rotate]);
  const rotateRight = useCallback(() => rotate(-1), [rotate]);
  const rotateCoal = useCallback(() => {
    setSelectedStations((selectedStations) => {
      const coalIndex = selectedStations.indexOf(COAL_HOPPER);
      const positionIndex = (position ?? 0) - 1;
      const targetIndex = (8 + coalIndex - positionIndex) % 8;
      return coalIndex >= 0
        ? [
            ...selectedStations.slice(targetIndex),
            ...selectedStations.slice(0, targetIndex),
          ]
        : selectedStations;
    });
  }, [position]);
  const reset = useCallback(
    () => setSelectedStations(initialSelectedStations ?? []),
    [initialSelectedStations],
  );

  const submit = useCallback(
    async (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();

      const button: HTMLButtonElement = event.currentTarget;
      const form = button.form;
      if (!form) throw new Error("No form!");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const formData = new URLSearchParams(new FormData(form) as any);
      setIsLoading(true);
      try {
        await fetch("/choice.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData,
        });
        setIsLoading(false);
        setServerSelectedStations(selectedStations);
      } catch (e) {
        console.error(e);
      }
    },
    [selectedStations],
  );

  const duplicates = new Set(selectedStations).size < 8;

  return (
    <Stack
      align="center"
      textAlign="center"
      p={8}
      border={duplicates ? "solid 3px red" : undefined}
      borderRadius={8}
    >
      <Heading as="h2" size="lg" m={0}>
        High-Speed Rail
      </Heading>
      <Text m={0}>Your train is at position {position}.</Text>
      <Heading as="h3" size="md" mb={0} mt={8}>
        Effects
      </Heading>
      <Table.Root textAlign="center">
        <Table.Body>
          {allEffectTurns.map((effects, index) => (
            <Table.Row key={index}>
              {effects.map(
                ([effect, turns], index) =>
                  [0, 1].some((i) => allEffectTurns[i][index][1] > 0) && (
                    <Table.Cell
                      key={effect.name}
                      fontWeight={turns > 0 ? "bold" : undefined}
                      fontStyle={turns > 0 ? undefined : "italic"}
                    >
                      {effect.name} ({turns})
                    </Table.Cell>
                  ),
              )}
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
      <Stack as="form" align="stretch" mt={0} mb={16}>
        <input type="hidden" name="whichchoice" value="1485" />
        <input type="hidden" name="option" value="1" />
        <input type="hidden" name="pwd" value={pwd} />
        <Stack direction="row" justify="center">
          <IconButton onClick={rotateLeft} size="xs">
            <ArrowUp />
          </IconButton>
          <Button onClick={rotateCoal}>Rotate: Coal Hopper</Button>
          <IconButton onClick={rotateRight} size="xs">
            <ArrowDown />
          </IconButton>
        </Stack>
        <Stack direction="row" justify="center">
          <Button onClick={reset}>Reset</Button>
        </Stack>
        {selectedStations.map((selected, index) => {
          const highlight = index === (position ?? 0) - 1;
          return (
            <Stack
              key={index}
              direction="row"
              borderRadius="6px"
              px={1}
              py={highlight ? 1 : 0}
              bgColor={highlight ? "blue" : undefined}
              color={highlight ? "white" : undefined}
              justify="flex-end"
            >
              {highlight && <CircleArrowRight />}
              <NativeSelectRoot disabled={isLoading}>
                {index + 1}.{" "}
                <NativeSelectField
                  name={`slot[${index}]`}
                  value={selected}
                  color={isLoading ? "gray.500" : undefined}
                  onChange={(event) => {
                    const station = parseInt(event.target.value);
                    const newSelectedStations = [...selectedStations];
                    newSelectedStations.splice(index, 1, station);
                    return setSelectedStations(newSelectedStations);
                  }}
                >
                  {stations?.map(([id, text]) => (
                    <option key={id} value={id}>
                      {id === serverSelectedStations[index] ? `*${text}` : text}
                    </option>
                  ))}
                </NativeSelectField>
              </NativeSelectRoot>
            </Stack>
          );
        })}
        {duplicates && (
          <Text m={0} fontWeight="bold">
            Can't have duplicate stations!
          </Text>
        )}
        <Stack direction="row" justify="center">
          <Button
            type="submit"
            onClick={submit}
            disabled={duplicates || isLoading}
          >
            Submit
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default Layout;
