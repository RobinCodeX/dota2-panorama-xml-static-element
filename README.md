# Dota2 Panorama XML Static Element

#### Before

```xml
<root>
    <styles>
        <include src="file://{resources}/styles/test.css" />
    </styles>
    <scripts>
        <include src="file://{resources}/scripts/test.js" />
    </scripts>
    <snippets>
    </snippets>
    <Panel class="test_root">
        <!-- Element of CustomElementA -->
        <Template name="CustomElementA">
            <Panel id="CustomElementA" class="Demo">
                <Panel id="Header" bind="Header" />
                <Panel id="Body" bind="BestBody" />
                <Panel id="Footer" >
                    <Panel bind="FooterLeft" />
                </Panel>
            </Panel>
        </Template>
        <!-- CustomButton -->
        <Template name="CustomButton">
            <Panel id="CustomButton" onactivate="[click]">
                <Image src="file://{images}/custom_game/icons/[icon].png" />
                <Label text="[text]" />
            </Panel>
        </Template>

        <CustomElementA>
            <Header>
                <Label text="Header of CustomElementA" />
                <Button id="CloseButton" />
            </Header>
            <BestBody>
                <Label text="Body of CustomElementA" />
                <CustomButton icon="cancel" text="#DOTA_Cancel" click="OnCancel()" />
            </BestBody>
            <FooterLeft>
                <Label text="Footer of CustomElementA" />
            </FooterLeft>
        </CustomElementA>

        <CustomButton icon="plus" text="Button Text" click="OnClick()" />

    </Panel>
</root>
```

#### After

```xml
<root>
    <styles>
        <include src="file://{resources}/styles/test.css"/>
    </styles>
    <scripts>
        <include src="file://{resources}/scripts/test.js"/>
    </scripts>
    <snippets>
    </snippets>
    <Panel class="test_root">
        <Panel id="CustomElementA" class="Demo">
            <Panel id="Header">
                <Label text="Header of CustomElementA"/>
                <Button id="CloseButton"/>
            </Panel>
            <Panel id="Body">
                <Label text="Body of CustomElementA"/>
                <Panel id="CustomButton" onactivate="OnCancel()">
                    <Image src="file://{images}/custom_game/icons/cancel.png"/>
                    <Label text="#DOTA_Cancel"/>
                </Panel>
            </Panel>
            <Panel id="Footer">
                <Panel>
                    <Label text="Footer of CustomElementA"/>
                </Panel>
            </Panel>
        </Panel>
        <Panel id="CustomButton" onactivate="OnClick()">
            <Image src="file://{images}/custom_game/icons/plus.png"/>
            <Label text="Button Text"/>
        </Panel>
    </Panel>
</root>
```
